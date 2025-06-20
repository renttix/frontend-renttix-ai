'use client'
import { useState } from "react";
import { BaseURL } from "../../../utils/baseUrl";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Simple client-side validation
    if (!formData.name || !formData.email || !formData.message) {
      setLoading(false);
      setError("All fields are required.");
      return;
    }

    const response = await fetch(`${BaseURL}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message);
      setFormData({ name: "", email: "", message: "" });
    } else {
      setError(data.error || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-4 pb-40 pt-12">
              <div className="flex justify-center items-center">
              <label className="text-[25px] font-bold text-[#131314] md:text-[30px] lg:text-[46px] mb-5">
               Contact Us
            </label>
              </div>
      {error && <div className="bg-red-200 text-red-800 p-2 mb-4">{error}</div>}
      {success && (
        <div className="bg-green-200 text-green-800 p-2 mb-4">{success}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Your Name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Your Email"
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="message"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="5"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Your Message"
          />
        </div>

        <div className="flex justify-center items-center">
        <button
          type="submit"
          disabled={loading}
          className={` p-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
