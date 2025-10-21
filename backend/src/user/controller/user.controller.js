// Please don't change the pre-written code
// Import the necessary modules here

import { sendPasswordResetEmail } from "../../../utils/emails/passwordReset.js";
import { sendWelcomeEmail } from "../../../utils/emails/welcomeMail.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import { sendToken } from "../../../utils/sendToken.js";
import {
  createNewUserRepo,
  deleteUserRepo,
  findUserForPasswordResetRepo,
  findUserRepo,
  getAllUsersRepo,
  updateUserProfileRepo,
  updateUserRoleAndProfileRepo,
} from "../models/user.repository.js";
import crypto from "crypto";

export const createNewUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const newUser = await createNewUserRepo(req.body);

    await sendToken(newUser, res, 200);

    // Implement sendWelcomeEmail function to send welcome message
    sendWelcomeEmail(newUser).catch((emailErr) =>
      console.log("Error sending welcome email:", emailErr)
    );
  } catch (err) {
    //  handle error for duplicate email
    if (err.code === 11000 && err.keyPattern?.email) {
      return next(
        new ErrorHandler(400, "Email already exists. Please use another one.")
      );
    }
    return next(new ErrorHandler(500, "Failed to register user."));
  }
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler(400, "please enter email/password"));
    }
    const user = await findUserRepo({ email }, true);
    if (!user) {
      return next(
        new ErrorHandler(401, "user not found! register yourself now!!")
      );
    }
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Invalid email or passswor!"));
    }
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const logoutUser = async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({ success: true, msg: "logout successful" });
};

export const forgetPassword = async (req, res, next) => {
  // Implement feature for forget password
  try {
    const { email } = req.body;
    console.log("🔍 Forgot Password Requested for:", email);

    const user = await findUserRepo({ email });

    if (!user) {
      console.log("❌ User not found");
      return next(new ErrorHandler(404, "User not found with this email"));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${resetToken}`;

    try {
      await sendPasswordResetEmail(user, resetURL);
      res.status(200).json({
        success: true,
        message: `Reset password email sent to ${user.email}`,
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new ErrorHandler(500, "Email could not be sent"));
    }
  } catch (err) {
    console.error("⚠️ Error in forgotPassword:", err);
    return next(new ErrorHandler(500, err.message));
  }
};

export const resetUserPassword = async (req, res, next) => {
  // Implement feature for reset password
  try {
    const resetTokenHashed = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await findUserForPasswordResetRepo({
      resetPasswordToken: resetTokenHashed,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorHandler(400, "Invalid or expired reset token"));
    }

    const { password, confirmPassword } = req.body;
    if (!password || password !== confirmPassword) {
      return next(new ErrorHandler(400, "Passwords do not match"));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    await sendToken(user, res, 200);
  } catch (err) {
    return next(new ErrorHandler(500, err.message));
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.user._id });
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  try {
    if (!currentPassword) {
      return next(new ErrorHandler(401, "pls enter current password"));
    }

    const user = await findUserRepo({ _id: req.user._id }, true);
    const passwordMatch = await user.comparePassword(currentPassword);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Incorrect current password!"));
    }

    if (!newPassword || newPassword !== confirmPassword) {
      return next(
        new ErrorHandler(401, "mismatch new password and confirm password!")
      );
    }

    user.password = newPassword;
    await user.save();
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updateUserProfile = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const updatedUserDetails = await updateUserProfileRepo(req.user._id, {
      name,
      email,
    });
    res.status(201).json({ success: true, updatedUserDetails });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// admin controllers
export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await getAllUsersRepo();
    res.status(200).json({ success: true, allUsers });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const getUserDetailsForAdmin = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.params.id });
    if (!userDetails) {
      return res
        .status(400)
        .json({ success: false, msg: "no user found with provided id" });
    }
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await deleteUserRepo(req.params.id);
    if (!deletedUser) {
      return res
        .status(400)
        .json({ success: false, msg: "no user found with provided id" });
    }

    res
      .status(200)
      .json({ success: true, msg: "user deleted successfully", deletedUser });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updateUserProfileAndRole = async (req, res, next) => {
  // Write your code here for updating the roles of other users by admin
  try {
    const { name, email, role } = req.body;
    const { id } = req.params;

    //ensure role is valid
    if (!["user", "admin"].includes(role)) {
      return next(new ErrorHandler(400, "Invalid role specified"));
    }

    const updatedUser = await updateUserRoleAndProfileRepo(id, {
      name,
      email,
      role,
    });

    if (!updatedUser) {
      return next(new ErrorHandler(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "User role and profile updated successfully",
      updatedUser,
    });
  } catch (err) {
    console.log(err);
    return next(new ErrorHandler(500, err.message));
  }
};
