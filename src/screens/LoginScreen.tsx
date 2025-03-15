/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Loader from "../components/common/Loader";
import { setCredentials } from "../slices/authSlice";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/const";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  status: string;
  superAdmin: {
    _id: string;
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

const loginUser = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await axios.post(`${BASE_URL}/login`, credentials, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

const LoginScreen = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Using React Query's useMutation hook for the login operation
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Show success toast
      toast.success("Login successful!");

      // Handle successful login
      dispatch(setCredentials(data.superAdmin));
      navigate("/");
    },
    onError: (error: any) => {
      // Show error toast with the error message
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);

      console.error("Login error:", error);
    },
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Use the mutation to trigger the login
    mutation.mutate({
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <div className="flex justify-center px-4 items-center min-h-screen">
      {mutation.isPending ? (
        <Loader />
      ) : (
        <form
          onSubmit={handleSubmit}
          className=" p-6 rounded-lg border border-gray-200 shadow-xl w-full max-w-md"
        >
          <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full cursor-pointer bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>
      )}
    </div>
  );
};

export default LoginScreen;
