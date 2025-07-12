import React, { useRef, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import { BaseURL, imageBaseURL } from "../../../utils/baseUrl";
import { setUpdateUser } from "@/store/authSlice";
import { FiCamera, FiUpload } from "react-icons/fi";

const ImgUpload = ({ onChange, src, profileFields = [],completionPercentage }) => {
  const [uploaded, setUploaded] = useState(!!src);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = (e) => {
    setUploaded(true);
    onChange(e);
  };

  // Calculate angle for the conic gradient (e.g. 70% -> 252deg)
  const angle = completionPercentage * 3.6;

  return (
    <div className="flex flex-col items-center gap-3">
      <label
        htmlFor="photo-upload"
        className="cursor-pointer relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Outer container with a conic-gradient border */}
        <div
          className="rounded-full p-[6px] transition-all duration-300 hover:scale-105"
          style={{
            background: `conic-gradient(#f9791d 0deg, #f9791d ${angle}deg, #62748e ${angle}deg, #62748e 360deg)`,
            boxShadow: isHovered ? '0 8px 24px rgba(249, 121, 29, 0.3)' : 'none'
          }}
        >
          {/* Inner container that holds the image */}
          <div className="rounded-full overflow-hidden relative">
            <img
              className="h-50 w-50 cursor-pointer rounded-full transition-all duration-300 group-hover:brightness-75"
              src={src || "/default-profile.png"}
              alt="Profile Picture"
            />
            {/* Overlay with camera icon */}
            <div className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <div className="text-white text-center">
                <FiCamera className="text-3xl mx-auto mb-1" />
                <span className="text-xs font-medium">Change Photo</span>
              </div>
            </div>
          </div>
        </div>
        <input
          className="hidden"
          id="photo-upload"
          type="file"
          accept=".jpg, .jpeg, .png, .gif"
          onChange={handleFileChange}
        />
        {/* Upload badge */}
        <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110">
          <FiUpload className="text-lg" />
        </div>
      </label>
      <div className="text-center">
        <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">Profile Completion: {completionPercentage}%</p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Click to upload new photo</p>
      </div>
    </div>
  );
};

const AvatarUpload = ({completionPercentage}) => {
  const { user } = useSelector((state) => state?.authReducer);
  const dispatch = useDispatch();
  const toast = useRef();
  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    `${imageBaseURL}/${user?.profile_Picture}`,
  );

  const photoUpload = async (e) => {
    e.preventDefault();
    const reader = new FileReader();
    const file = e.target.files[0]; // Get the file from input
    const formData = new FormData();

    formData.append("profile_Picture", file);

    reader.onloadend = async () => {
      setImagePreviewUrl(reader.result);

      // Upload the file to the server using PUT
      try {
        const res = await axios.put(
          `${BaseURL}/vender/profile-picture/${user._id}`,
          formData,
        );
        dispatch(setUpdateUser(res.data.data.user));
        console.log(res.data.message);

        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: res?.data?.message,
          life: 3000,
        });

        console.log("File uploaded successfully:", res.data);
        // window.location.reload();
      } catch (error) {
        console.error("File upload failed:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "File upload failed!",
          life: 3000,
        });
      }
    };

    reader.readAsDataURL(file); // Read the file as a data URL
  };

  return (
    <div>
      <Toast ref={toast} position="top-right" />
      <ImgUpload completionPercentage={completionPercentage} onChange={photoUpload} src={imagePreviewUrl} />
    </div>
  );
};

export default AvatarUpload;
