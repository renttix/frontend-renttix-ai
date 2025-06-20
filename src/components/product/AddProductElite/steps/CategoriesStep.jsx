import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { motion } from "framer-motion";
import axios from "axios";
import { BaseURL } from "../../../../../utils/baseUrl";
import { 
  FiTag, FiMapPin, FiPlus, FiSearch, FiTrendingUp,
  FiGrid, FiList, FiChevronRight
} from "react-icons/fi";
import AddDepotsModal from "../../../system-setup/depots/AddDepotsModal";
import UpdateCategoryModel from "../../../category/UpdateCategoryModel";
import ConfirmLink from "../../../confirmLink/ConfirmLink";

export default function CategoriesStep({
  formData,
  updateFormData,
  errors,
  categories,
  setCategories,
  subCategories,
  setSubCategories,
  depots,
  setDepots,
  token
}) {
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [loadingDepots, setLoadingDepots] = useState(false);
  const [popularCategories, setPopularCategories] = useState([]);
  const [refreshCategory, setRefreshCategory] = useState(false);
  const [refreshSubCategory, setRefreshSubCategory] = useState(false);
  const [depotRefresh, setDepotRefresh] = useState(false);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await axios.get(`${BaseURL}/category`, {
          headers: { authorization: `Bearer ${token}` },
        });
        setCategories(response.data);
        
        // Set popular categories (top 6)
        setPopularCategories(response.data.slice(0, 6));
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, [refreshCategory, token]);
  
  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!formData.category) {
        setSubCategories([]);
        return;
      }
      
      setLoadingSubCategories(true);
      try {
        const response = await axios.get(
          `${BaseURL}/sub-category?parentId=${formData.category}`,
          {
            headers: { authorization: `Bearer ${token}` },
          }
        );
        setSubCategories(response.data);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      } finally {
        setLoadingSubCategories(false);
      }
    };
    
    fetchSubCategories();
  }, [formData.category, refreshSubCategory, token]);
  
  // Fetch depots
  useEffect(() => {
    const fetchDepots = async () => {
      setLoadingDepots(true);
      try {
        const response = await axios.get(`${BaseURL}/depots`, {
          headers: { authorization: `Bearer ${token}` },
        });
        setDepots(response.data.data);
      } catch (err) {
        console.error("Error fetching depots:", err);
      } finally {
        setLoadingDepots(false);
      }
    };
    
    fetchDepots();
  }, [depotRefresh, token]);
  
  const handleCategorySelect = (categoryId) => {
    updateFormData({ 
      category: categoryId,
      subCategory: "" // Reset subcategory when category changes
    });
  };
  
  const selectedCategory = categories.find(cat => cat._id === formData.category);
  const selectedDepot = depots.find(depot => depot.name === formData.depots);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiTag className="mr-3 text-blue-600" />
          Categories & Location
        </h2>
        <p className="mt-2 text-gray-600">
          Organize your product and specify where it's available
        </p>
      </div>
      
      {/* Popular Categories */}
      {popularCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6"
        >
          <div className="flex items-center mb-4">
            <FiTrendingUp className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Popular Categories</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {popularCategories.map((category) => (
              <motion.button
                key={category._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategorySelect(category._id)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${formData.category === category._id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    {category.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                  {formData.category === category._id && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Category Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              <ConfirmLink href="/system-setup/category">
                <Button
                  icon={<FiGrid className="w-4 h-4" />}
                  label="Manage"
                  className="p-button-text p-button-sm"
                />
              </ConfirmLink>
              <UpdateCategoryModel
                title="Add New Category"
                parent={null}
                fetchDataList={() => setRefreshCategory(!refreshCategory)}
                pageName="product"
              />
            </div>
          </div>
          
          <Dropdown
            value={formData.category}
            onChange={(e) => handleCategorySelect(e.value)}
            options={categories}
            optionLabel="name"
            optionValue="_id"
            placeholder="Select a category"
            filter
            showClear
            loading={loadingCategories}
            className={`w-full ${errors.category ? 'p-invalid' : ''}`}
            emptyFilterMessage="No categories found"
            filterPlaceholder="Search categories..."
          />
          
          {errors.category && (
            <small className="text-red-500 text-xs mt-1">{errors.category}</small>
          )}
        </div>
        
        {/* Subcategory */}
        {formData.category && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Subcategory
              </label>
              <div className="flex items-center space-x-2">
                <ConfirmLink href={`/system-setup/category/sub-category/${formData.category}`}>
                  <Button
                    icon={<FiList className="w-4 h-4" />}
                    label="Manage"
                    className="p-button-text p-button-sm"
                  />
                </ConfirmLink>
                <UpdateCategoryModel
                  id={formData.category}
                  title="Add New Subcategory"
                  parent={selectedCategory?.name}
                  fetchDataList={() => setRefreshSubCategory(!refreshSubCategory)}
                  pageName="product"
                />
              </div>
            </div>
            
            <Dropdown
              value={formData.subCategory}
              onChange={(e) => updateFormData({ subCategory: e.value })}
              options={subCategories}
              optionLabel="name"
              optionValue="_id"
              placeholder={loadingSubCategories ? "Loading..." : "Select a subcategory (optional)"}
              filter
              showClear
              loading={loadingSubCategories}
              disabled={!formData.category || loadingSubCategories}
              className="w-full"
              emptyMessage="No subcategories available"
            />
          </motion.div>
        )}
      </div>
      
      {/* Location/Depot Selection */}
      <div className="border-t pt-6">
        <div className="flex items-center mb-4">
          <FiMapPin className="text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Product Location</h3>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Depot/Warehouse <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              <ConfirmLink href="/system-setup/depots">
                <Button
                  icon={<FiMapPin className="w-4 h-4" />}
                  label="Manage"
                  className="p-button-text p-button-sm"
                />
              </ConfirmLink>
              <AddDepotsModal refreshParent={() => setDepotRefresh(!depotRefresh)} />
            </div>
          </div>
          
          <Dropdown
            value={formData.depots}
            onChange={(e) => updateFormData({ depots: e.value })}
            options={depots}
            optionLabel="name"
            optionValue="name"
            placeholder="Select depot location"
            filter
            showClear
            loading={loadingDepots}
            className={`w-full ${errors.depots ? 'p-invalid' : ''}`}
            emptyFilterMessage="No depots found"
            itemTemplate={(option) => (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{option.name}</div>
                  {option.address && (
                    <div className="text-xs text-gray-500">{option.address}</div>
                  )}
                </div>
                {option.code && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {option.code}
                  </span>
                )}
              </div>
            )}
          />
          
          {errors.depots && (
            <small className="text-red-500 text-xs mt-1">{errors.depots}</small>
          )}
          
          {selectedDepot && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-gray-50 rounded-lg"
            >
              <p className="text-sm text-gray-600">
                This product will be available at: <span className="font-medium text-gray-900">{selectedDepot.name}</span>
              </p>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Category Path Display */}
      {(formData.category || formData.subCategory) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 rounded-lg p-4"
        >
          <p className="text-sm text-blue-900 flex items-center">
            <span className="font-medium mr-2">Category Path:</span>
            {selectedCategory?.name}
            {formData.subCategory && (
              <>
                <FiChevronRight className="mx-2 text-blue-600" />
                {subCategories.find(sub => sub._id === formData.subCategory)?.name}
              </>
            )}
          </p>
        </motion.div>
      )}
    </div>
  );
}