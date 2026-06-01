import { Request, Response } from "express";
import * as Yup from "yup";

import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IRequestUser } from "../middlewares/auth.middleware";

type TRegister = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TLogin = {
  identifier: string;
  password: string;
};

const registerValidateSchema = Yup.object({
  fullName: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().required(),
  password: Yup.string()
    .required()
    .min(6, "Password must be at least 6 characters")
    .test(
      "at-least-one-uppercase",
      "Password must contain at least one uppercase letter",
      (value) => {
        if (!value) return false;
        const regex = /^(?=.*[A-Z])/;
        return regex.test(value);
      },
    )
    .test(
      "at-least-one-number",
      "Password must contain at least one number",
      (value) => {
        if (!value) return false;
        const regex = /^(?=.*\d)/;
        return regex.test(value);
      },
    ),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("password"), ""], "Password must be match"),
});

export default {
  async register(req: Request, res: Response) {
    const { fullName, username, email, password, confirmPassword } =
      req.body as unknown as TRegister;

    try {
      await registerValidateSchema.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      const result = await UserModel.create({
        fullName,
        username,
        email,
        password,
      });

      return res.status(200).json({
        message: "Success Registration",
        data: result,
      });
    } catch (error) {
      const err = error as unknown as Error;
      return res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },

  async login(req: Request, res: Response) {
    const { identifier, password } = req.body as unknown as TLogin;

    try {
      const userByIdentifier = await UserModel.findOne({
        $or: [
          {
            email: identifier,
          },
          {
            username: identifier,
          },
        ],
        isActive: true,
      });

      if (!userByIdentifier) {
        return res.status(403).json({
          message: "User not found",
          data: null,
        });
      }

      const validatePassword: boolean =
        encrypt(password) === userByIdentifier!.password;

      if (!validatePassword) {
        return res.status(403).json({
          message: "User not found",
          data: null,
        });
      }

      const token = generateToken({
        id: userByIdentifier!._id,
        role: userByIdentifier!.role,
      });

      return res.status(200).json({
        message: "Login Successfully",
        data: token,
      });
    } catch (error) {
      const err = error as unknown as Error;
      return res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },

  async me(req: IRequestUser, res: Response) {
    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id);

      return res.status(200).json({
        message: "Success",
        data: result,
      });
    } catch (error) {
      const err = error as unknown as Error;
      return res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },

  async activation(req: Request, res: Response) {
    try {
      const { code } = req.body as { code: string };

      const user = await UserModel.findOneAndUpdate(
        {
          activationCode: code,
        },
        {
          isActive: true,
        },
        {
          new: true,
        },
      );
      return res.status(200).json({
        message: "Account activated successfully",
        data: user,
      });
    } catch (error) {
      const err = error as unknown as Error;
      return res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },
};
