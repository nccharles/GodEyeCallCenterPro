const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../Models/userModel");
const crypto = require("crypto");
const NodeCache = require('node-cache');
const userCache = new NodeCache({stdTTL: 300}); // 300 seconds = 5 minutes

const createToken = (_id) => {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    return jwt.sign({_id}, jwtSecretKey, {expiresIn: "3d"});
};

const registerUser = async (req, res) => {
    try {
        const evt = req.body;
        const {id, ...attributes} = evt.data;
        const eventType = evt.type;
        const defaultPassword = crypto.randomBytes(8).toString("hex");
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        const userEmail = attributes.email_addresses[0].email_address;

        let user = await userModel.findOne({email: new RegExp(`^${userEmail}$`, 'i')});

        const updatedData = {
            id,
            name: attributes.first_name,
            first_name: attributes.first_name,
            last_name: attributes.last_name,
            picture: attributes.image_url,
        };

        if (eventType === 'user.created' && !user) {
            // Create new user if not found
            user = new userModel({...updatedData, email: userEmail, password: hashedPassword});
            console.log('User is created');
        } else if (eventType === 'user.created' && user) {
            // Update existing user
            Object.assign(user, {
                ...updatedData,
                updatedAt: new Date().getTime()
            })
            console.log('User is updated');
        }
        await user.save();
        res.status(200).json({success: true, message: 'Webhook received'});

    } catch (err) {
        res.status(400).json({success: false, message: err.message});
    }
};


const loginUser = async (req, res) => {
    const {id, email, first_name, last_name, picture} = req.body;

    try {
        let user = await userModel.findOne({email: new RegExp(`^${email}$`, 'i')});
        if (!user) {
            // Encrypt email to create a username
            const defaultPassword = crypto.randomBytes(8).toString("hex");
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);

            user = new userModel({
                id,
                email,
                name: first_name,
                first_name,
                last_name,
                picture,
                password: hashedPassword,
            });

            await user.save();
            console.log(user.first_name, " is Created")
            return res.status(201).json({
                message: "New user created with default credentials",
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                first_name,
                last_name,
                picture,
                defaultPassword,
            });
        }

        const token = createToken(user._id);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            picture: user.picture,
            email,
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};


const findUser = async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await userModel.findById(userId);

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error);
    }
};

const getUsers = async (req, res) => {
    try {
        const {role} = req.body;

        // Default to ADMIN and SUPPORT if no role is specified
        const filter = role ? {role} : {role: "SUPPORT"};

        const users = await userModel.find(filter);

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
};

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Unique cache key for this page/limit
        const cacheKey = `users_page${page}_limit${limit}`;
        const cached = userCache.get(cacheKey);

        if (cached) {
            return res.status(200).json(cached);
        }

        const users = await userModel.aggregate([
            {
                $addFields: {
                    rolePriority: {
                        $switch: {
                            branches: [
                                {case: {$eq: ["$role", "ADMIN"]}, then: 1},
                                {case: {$eq: ["$role", "SUPPORT"]}, then: 2},
                                {case: {$eq: ["$role", "USER"]}, then: 3},
                            ],
                            default: 4
                        }
                    }
                }
            },
            {
                $sort: {
                    rolePriority: 1,
                    createdAt: -1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $project: {
                    rolePriority: 0
                }
            }
        ]);

        // Optionally get total count for frontend pagination
        const totalCount = await userModel.countDocuments({});
        const totalPages = Math.ceil(totalCount / limit);

        const response = {
            page,
            limit,
            totalPages,
            totalCount,
            users
        };

        userCache.set(cacheKey, response);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
};

module.exports = {registerUser, loginUser, findUser, getUsers, getAllUsers};
