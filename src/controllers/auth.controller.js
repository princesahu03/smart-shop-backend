import { User } from '../models/user.model.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Register:


const registerUser = asyncHandler(async (req, res) => {
  console.log("Step 1");

  const { shopName, ownerName, email, password, phone } = req.body;

    console.log("Step 2");

    if ([shopName, ownerName, email, password, phone].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields required!");
    }

    const existedUser = await User.findOne({ email });

    console.log("Step 3");

    if (existedUser) {
        throw new ApiError(409, "Email already registered!");
    }

    console.log("Step 4");

    try {
        const user = await User.create({
            shopName,
            ownerName,
            email,
            password,
            phone
        });

        console.log("Step 5");

        const createdUser = await User.findById(user._id).select("-password");

        console.log("Step 6");

        return res.status(201).json(
            new ApiResponse(
                201,
                createdUser,
                "Shop registered successfully!"
            )
        );

    } catch (err) {
        console.log("========== CREATE ERROR ==========");
        console.error(err);
        console.log("==================================");
        throw err;
    }
});

// Login:
const loginUser = asyncHandler(
  async (req, res) => {const { email, password } = req.body

    

    if (!email || !password) {
      throw new ApiError(400, 
        "Email and password required!")
    }
    

    const user = await User.findOne({ email })
    if (!user) {
      throw new ApiError(404, 
        "User not found!")
    }

    const isPasswordValid = 
      await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
      throw new ApiError(401, 
        "Wrong password!")
    }

    const token = user.generateToken()

    const options = {
      httpOnly: true,
      secure: true
    }

    return res
      .status(200)
      .cookie("token", token, options)
      .json(
        new ApiResponse(200, {
          user: {
            _id: user._id,
            shopName: user.shopName,
            ownerName: user.ownerName,
            email: user.email
          },token}, "Login successful!")
      )
  }
)

// Logout:
const logoutUser = asyncHandler(
  async (req, res) => {
    return res
      .status(200)
      .clearCookie("token")
      .json(
        new ApiResponse(
          200, {}, 
          "Logout successful!"
        )
      )
  }
)

// Get Current User:
const getCurrentUser = asyncHandler(
  async (req, res) => {
    return res.status(200).json(
      new ApiResponse(
        200,
        req.user,
        "User fetched!"
      )
    )
  }
)

export { 
  registerUser, 
  loginUser, 
  logoutUser,
  getCurrentUser
}