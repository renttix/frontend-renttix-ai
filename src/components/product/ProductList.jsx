"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";
import { Badge } from "primereact/badge";
import { Tooltip } from "primereact/tooltip";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import { BaseURL } from "../../../utils/baseUrl";
import CanceButton from "../Buttons/CanceButton";
import Link from "next/link";
import ImportDataModal from "../system-setup/import-data/ImportDataModal";
import TableComponent from "../common/table/TableComponent";
import useDebounce from "@/hooks/useDebounce";
import { Paginator } from "primereact/paginator";
import ExportData from "../common/imports/ExportData";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import { setDefaultColumns } from "@/store/columnVisibilitySlice";
import { formatCurrency } from "../../../utils/helper";
import useResponsive from "@/hooks/useResponsive";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import {
  openFilterPanel,
  toggleFilterPanel,
  closeFilterPanel,
  setFiltersFromURL,
  selectActiveFiltersCount,
  selectFiltersAsParams
} from "@/store/productFiltersSlice";

const ProductList = React.memo(() => {
  let emptyProduct = {
    id: null,
    name: "",
    image: null,
    description: "",
    category: null,
    price: 0,
    quantity: 0,
    rating: 0,
    inventoryStatus: "INSTOCK",
  };

  const [products, setProducts] = useState([]);
  const [productDialog, setProductDialog] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
  const [product, setProduct] = useState(emptyProduct);
  const [selectedProducts, setSelectedProducts] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedLoader, setselectedLoader] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const [loading, setloading] = useState(false);
  const toast = useRef(null);
  const router = useRouter();
  const debouncedSearch = useDebounce(search, 1000); // Add debounce with a 500ms delay
  const dispatch = useDispatch()
  const currency = useSelector((state) => state?.authReducer?.user?.currencyKey);
  const { isMobile, isTabletOrAbove } = useResponsive();
  const searchParams = useSearchParams();
  const activeFiltersCount = useSelector(selectActiveFiltersCount);
  const filterParams = useSelector(selectFiltersAsParams);
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const tableRef = useRef(null);


  const Columns = {
    thumbnail: "Product",
    productName: "Product Name",
    rentPrice: "Price",
    depots: "Depots",
    status: "Category",
    totalQuantity: "Total Quantity",
    quantity: "Available Quantity",
    onRent: "Rented",
    assetNumbers: "Asset Numbers",
    minimumRentalPeriod: "Min Rental Period",
    stockStatus: "Status",
    action: "Action",
  };

  useEffect(() => {
    dispatch(setDefaultColumns({ tableName: "Product", columns: Object.keys(Columns) }));
  }, [dispatch]);

  

  const { token, user } = useSelector((state) => state?.authReducer);


  const id = ["Admin",'Seller'].includes(user?.role)
    ? user?._id
    : user?.vendor;

  // Initialize filters from URL on mount
  useEffect(() => {
    const urlFilters = {
      priceMin: searchParams.get('priceMin'),
      priceMax: searchParams.get('priceMax'),
      stockStatus: searchParams.get('stockStatus'),
      categories: searchParams.get('categories'),
      depot: searchParams.get('depot')
    };
    
    // Only dispatch if there are actual filters in URL
    if (Object.values(urlFilters).some(value => value !== null)) {
      dispatch(setFiltersFromURL(urlFilters));
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    // Remove all filter params first
    ['priceMin', 'priceMax', 'stockStatus', 'categories', 'depot'].forEach(key => {
      params.delete(key);
    });
    
    // Add active filter params
    Object.entries(filterParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, value);
      }
    });
    
    // Update URL without navigation
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [filterParams, searchParams]);

  useEffect(() => {
    setloading(true);
    
    // Build query params including filters
    const queryParams = new URLSearchParams({
      search: debouncedSearch,
      page: page.toString(),
      limit: rows.toString(),
      ...filterParams
    });
    
    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/product/product-lists?${queryParams.toString()}`,
        { vendorId: id },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      )
      .then((response) => {
        setTotalRecords(response.data.pagination.total);
        setProducts(response.data.data);
        setloading(false);
      })
      .catch((error) => {
        // setError(error);
        setloading(false);
      });
  }, [page, rows, debouncedSearch, filterParams]);





  const hideDeleteProductDialog = () => {
    setDeleteProductDialog(false);
  };

  const hideDeleteProductsDialog = () => {
    setDeleteProductsDialog(false);
  };



  const confirmDeleteProduct = useCallback((product) => {
    setProduct(product);
    setDeleteProductDialog(true);
  }, []);

  const deleteProduct = async () => {
    try {
      await axios.delete(`${BaseURL}/product/delete-product/${product.id}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      let _products = products.filter((val) => val.id !== product.id);
      console.log(product.id);

      setProducts(_products);
      setDeleteProductDialog(false);
      setProduct(emptyProduct);
      toast.current.show({
        severity: "success",
        summary: "Successful",
        detail: "Product Deleted",
        life: 3000,
      });
    } catch (error) {
      console.log(error);
    }
  };


  

  const deleteSelectedProducts = async () => {
    setselectedLoader(true)
    const ids = selectedProducts?.map(item=>item?.id)
    try {
      await axios.delete(`${BaseURL}/product/products`, {
        data: { ids: ids }, 
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      let _products = products.filter((val) => !selectedProducts.includes(val));
      setselectedLoader(false)
      setProducts(_products);
      setDeleteProductsDialog(false);
      setSelectedProducts(null);
      toast.current.show({
        severity: "success",
        summary: "Successful",
        detail: "Products Deleted",
        life: 3000,
      });
    } catch (error) {
      console.log(error);
      setselectedLoader(false)

    }
  };




  const confirmDeleteSelected = useCallback(() => {
    setDeleteProductsDialog(true);
  }, []);

 



  // Keyboard navigation handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt+F to open filter panel
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        dispatch(toggleFilterPanel());
      }
      
      // Escape to close filter panel
      if (e.key === 'Escape') {
        dispatch(closeFilterPanel());
      }
      
      // Arrow key navigation for table rows
      if (!isMobile && products.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedRowIndex(prev => Math.min(prev + 1, products.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedRowIndex(prev => Math.max(prev - 1, -1));
        } else if ((e.key === 'Enter' || e.key === ' ') && selectedRowIndex >= 0) {
          e.preventDefault();
          const product = products[selectedRowIndex];
          if (product) {
            const isSelected = selectedProducts?.some(p => p.id === product.id);
            if (isSelected) {
              setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
            } else {
              setSelectedProducts([...(selectedProducts || []), product]);
            }
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, isMobile, products, selectedRowIndex, selectedProducts]);

  // Scroll selected row into view
  useEffect(() => {
    if (selectedRowIndex >= 0 && tableRef.current) {
      const rows = tableRef.current.querySelectorAll('tr[data-p-index]');
      if (rows[selectedRowIndex]) {
        rows[selectedRowIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedRowIndex]);

  const leftToolbarTemplate = useMemo(() => {
    return (
      <div className={`flex ${isMobile ? 'flex-col w-full' : 'flex-row flex-wrap'} gap-2`}>
        <Button
          label="Filters"
          icon="pi pi-filter"
          onClick={() => dispatch(openFilterPanel())}
          className="p-button-outlined"
          aria-label="Open filters"
          badge={activeFiltersCount > 0 ? activeFiltersCount.toString() : null}
          badgeClassName="p-badge-info"
        />
        <ImportDataModal ListData={[{ name: "Product" }]} />
        <ExportData route='/product/export' nameFile='product'/>
        {!isMobile && (
          <Button
            label="Delete"
            icon="pi pi-trash"
            style={{ background: "red" }}
            onClick={confirmDeleteSelected}
            disabled={!selectedProducts || !selectedProducts.length}
            aria-label="Delete selected products"
          />
        )}
        <Tooltip target=".keyboard-help" position="bottom" />
        <Button
          icon="pi pi-question-circle"
          className="p-button-text p-button-rounded keyboard-help"
          data-pr-tooltip="Keyboard shortcuts: Alt+F (Filters), ↑↓ (Navigate), Enter/Space (Select), Esc (Close)"
          aria-label="Keyboard shortcuts help"
        />
      </div>
    );
  }, [isMobile, selectedProducts, confirmDeleteSelected, dispatch, activeFiltersCount]);

 






  const getSeverity = (product) => {
    switch (product.stockStatus) {
      case "INSTOCK":
        return "success";

      case "LOWSTOCK":
        return "warning";

      case "OUTOFSTOCK":
        return "danger";

      default:
        return null;
    }
  };

  const onSearch = useCallback((e) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const onPageChange = useCallback((event) => {
    setPage(event.page + 1);
    setRows(event.rows);
  }, []);
  const header = useMemo(() => (
    <div className={`align-items-center justify-content-between flex ${isMobile ? 'w-full' : ''} flex-wrap gap-2`}>
      <IconField iconPosition="right" className={isMobile ? 'w-full' : ''}>
        {search == null || search == "" ? (
          <InputIcon className="pi pi-search" />
        ) : (
          <></>
        )}
        <InputText
          placeholder="Search products"
          value={search}
          onChange={onSearch}
          className={isMobile ? 'w-full' : ''}
          aria-label="Search products"
        />
      </IconField>
    </div>
  ), [search, onSearch, isMobile]);

  const deleteProductDialogFooter = (
    <React.Fragment>
      <div className="flex justify-end gap-2">
        <CanceButton onClick={hideDeleteProductDialog} />

        <Button
          label="Yes"
          icon="pi pi-check"
          severity="danger"
          onClick={deleteProduct}
        />
      </div>
    </React.Fragment>
  );
  const deleteProductsDialogFooter = (
    <React.Fragment>
      <div className="flex justify-end gap-2">
        <CanceButton onClick={hideDeleteProductsDialog} />

        <Button
          label="Yes"
          loading={selectedLoader}
          icon="pi pi-check"
          severity="danger"
          onClick={deleteSelectedProducts}
        />
      </div>
    </React.Fragment>
  );

  const handleEditProduct = useCallback((productId) => {
    router.push(`/product/${productId}`);
  }, [router]);

  const renderColumnsBody = useCallback((field, item) => {
    console.log({item})
    switch (field) {
      case "thumbnail":
        return (
          <Link href={`/product/${item.id}`}>
          <img
            className="border-round h-[50px] w-[50px] rounded-lg shadow-2"
            src={`${process.env.NEXT_PUBLIC_API_URL_IMAGE}${item.thumbnail}`}
            alt={item.thumbnail}
            onError={(e) => (e.currentTarget.src = "/images/product/placeholder.webp")} // Provide a dummy image path
            style={{ width: "64px" }}
          />
        </Link>
        
        );
      case "productName":
        return (
          <>
            <Link className="text-[#0068d6]" href={`/product/${item.id}`}>
              {item.productName}
            </Link>
          </>
        );
      case "rentPrice":
        return `${formatCurrency(item.rentPrice ?item.rentPrice:Number(item.salePrice),currency)}`;
       
      case "depots":
        return <Tag severity={"success"} value={item.depots} />;
      case "status":
        return (
          <>
            <Tag
              severity={item.status === "Rental" ? "warning" : "info"}
              value={item.status}
            ></Tag>
          </>
        );
      case "minimumRentalPeriod":
        return (
          <>
            <span>
              {item.minimumRentalPeriod}
              {item.minimumRentalPeriod >= 1 ? "days" : "-"}
            </span>
          </>
        );
      case "stockStatus":
        return (
          <Tag value={item.stockStatus} severity={getSeverity(item)}></Tag>
        );
      case "totalQuantity":
        return (
          <div className="w-48">
            {item.assetNumbers && item.assetNumbers.length > 0 ? (
              <div className="relative group">
                <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50 cursor-pointer">
                  {item.totalQuantity || item.assetNumbers.length} Asset{(item.totalQuantity || item.assetNumbers.length) > 1 ? 's' : ''}
                </button>
                <div className="absolute z-10 hidden group-hover:block bg-white border rounded shadow-lg mt-1 max-h-60 overflow-y-auto min-w-[200px]">
                  {item.assetNumbers.map((asset, index) => {
                    const assetObj = typeof asset === 'string' ? { number: asset, status: 'available' } : asset;
                    return (
                      <Link
                        key={index}
                        href={`/asset/${assetObj.number || assetObj}`}
                        className="block px-3 py-2 hover:bg-gray-100 text-sm whitespace-nowrap no-underline"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[#0068d6] hover:underline">{assetObj.number || assetObj}</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${
                            assetObj.status === 'available' ? 'bg-green-100 text-green-800' :
                            assetObj.status === 'rented' ? 'bg-yellow-100 text-yellow-800' :
                            assetObj.status === 'maintenance' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {assetObj.status || 'available'}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <span>{item.totalQuantity || 0}</span>
            )}
          </div>
        );
      case "assetNumbers":
        return (
          <div className="w-48">
            {item.assetNumbers && item.assetNumbers.length > 0 ? (
              <div className="relative group">
                <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50 cursor-pointer">
                  {item.assetNumbers.length} Asset{item.assetNumbers.length > 1 ? 's' : ''}
                </button>
                <div className="absolute z-10 hidden group-hover:block bg-white border rounded shadow-lg mt-1 max-h-60 overflow-y-auto min-w-[200px]">
                  {item.assetNumbers.map((asset, index) => {
                    const assetObj = typeof asset === 'string' ? { number: asset, status: 'available' } : asset;
                    return (
                      <Link
                        key={index}
                        href={`/asset/${assetObj.number || assetObj}`}
                        className="block px-3 py-2 hover:bg-gray-100 text-sm whitespace-nowrap no-underline"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[#0068d6] hover:underline">{assetObj.number || assetObj}</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${
                            assetObj.status === 'available' ? 'bg-green-100 text-green-800' :
                            assetObj.status === 'rented' ? 'bg-yellow-100 text-yellow-800' :
                            assetObj.status === 'maintenance' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {assetObj.status || 'available'}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <span className="text-gray-400">No assets</span>
            )}
          </div>
        );
        case "onRent":
        return (
          <div className="w-48">
            {item.assetNumbers && item.assetNumbers.length > 0 ? (
              <div className="relative group">
                <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50 cursor-pointer">
                  {item?.assetNumbers.filter(item=>item.status==='rented').length} Asset{item.assetNumbers.length > 1 ? 's' : ''}
                </button>
                <div className="absolute z-10 hidden group-hover:block bg-white border rounded shadow-lg mt-1 max-h-60 overflow-y-auto min-w-[200px]">
                  {item?.assetNumbers.filter(item=>item.status==='rented').map((asset, index) => {
                    const assetObj = typeof asset === 'string' ? { number: asset, status: 'available' } : asset;
                    return (
                      <Link
                        key={index}
                        href={`/asset/${assetObj.number || assetObj}`}
                        className="block px-3 py-2 hover:bg-gray-100 text-sm whitespace-nowrap no-underline"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[#0068d6] hover:underline">{assetObj.number || assetObj}</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${
                            assetObj.status === 'available' ? 'bg-green-100 text-green-800' :
                            assetObj.status === 'rented' ? 'bg-yellow-100 text-yellow-800' :
                            assetObj.status === 'maintenance' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {assetObj.status || 'available'}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <span className="text-gray-400">No assets</span>
            )}
          </div>
        );
      case "action":
        return (
          <React.Fragment>
            <Button
              icon="pi pi-pen-to-square"
              className="p-button-rounded p-button-text p-button-sm mr-2"
              onClick={() => handleEditProduct(item.id)}
              aria-label={`Edit ${item.productName}`}
              style={{ minWidth: '40px', minHeight: '40px' }}
            />
            <Button
              icon="pi pi-trash"
              className="p-button-rounded p-button-text p-button-danger p-button-sm"
              onClick={() => confirmDeleteProduct(item)}
              aria-label={`Delete ${item.productName}`}
              style={{ minWidth: '40px', minHeight: '40px' }}
            />
          </React.Fragment>
        );
      default:
        return item[field];
    }
  }, [currency, confirmDeleteProduct, handleEditProduct]);

  // Loading skeleton for mobile cards
  const MobileLoadingSkeleton = () => (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="p-4 border rounded-lg">
          <Skeleton height="12rem" className="mb-4" />
          <Skeleton height="2rem" className="mb-2" />
          <Skeleton height="1.5rem" className="mb-2" />
          <Skeleton height="1rem" className="mb-2" />
          <Skeleton height="1rem" />
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    if (products.length > 0 && isInitialLoad) {
      setIsInitialLoad(false);
      // Announce to screen readers that products have loaded
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `${products.length} products loaded`;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  }, [products, isInitialLoad]);

  const handleFiltersChange = useCallback((filters) => {
    // Reset page when filters change
    setPage(1);
  }, []);

  return (
    <div>
      {/* Skip navigation link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white p-2 rounded">
        Skip to main content
      </a>
        
      <div className="flex gap-3 mb-4">
        <GoPrevious route={'/dashboard'}/>
        <h1 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
          Products
        </h1>
      </div>

      {/* Product Filters Sidebar */}
      <ProductFilters onFiltersChange={handleFiltersChange} />


      <Toast ref={toast} role="alert" aria-live="assertive" aria-atomic="true" />
      
      <main id="main-content" className="card">
        <Toolbar
          className={`mb-4 ${isMobile ? 'flex-col items-start' : ''}`}
          left={leftToolbarTemplate}
          right={header}
          role="toolbar"
          aria-label="Product list toolbar"
        />
  
        {/* Mobile View - Card Layout */}
        {isMobile ? (
          <div>
            {loading ? (
              <MobileLoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 gap-4" role="list">
                {products.map((product) => (
                  <div key={product.id} role="listitem">
                    <ProductCard
                      product={product}
                      currency={currency}
                      onEdit={handleEditProduct}
                      onDelete={confirmDeleteProduct}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Desktop/Tablet View - Table with Virtual Scrolling */
          <div role="region" aria-label="Products table" ref={tableRef}>
            <TableComponent
              loading={loading}
              tableName="Products"
              columns={Columns}
              data={products}
              renderColumnBody={renderColumnsBody}
              selection={selectedProducts}
              onSelectionChange={setSelectedProducts}
              isSelection={true}
              virtualScrollerOptions={{
                itemSize: 46,
                scrollHeight: '400px',
                lazy: true,
                onLazyLoad: (event) => {
                  // Virtual scrolling lazy load handler
                  console.log('Lazy load triggered', event);
                }
              }}
              rowClassName={(data, index) => ({
                'bg-primary-50': index === selectedRowIndex
              })}
            />
          </div>
        )}
      </main>

      {products?.length > 0 && (
        <div role="navigation" aria-label="Pagination">
          <Paginator
            first={(page - 1) * rows}
            rows={rows}
            totalRecords={totalRecords}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={onPageChange}
            template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
          />
        </div>
      )}
    

      <Dialog
        visible={deleteProductDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteProductDialogFooter}
        onHide={hideDeleteProductDialog}
      >
        <div className="confirmation-content flex items-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {product && (
            <span>
              Are you sure you want to delete <b>{product.name}</b>?
            </span>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={deleteProductsDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteProductsDialogFooter}
        onHide={hideDeleteProductsDialog}
      >
        <div className="confirmation-content flex items-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {product && (
            <span>Are you sure you want to delete the selected products?</span>
          )}
        </div>
      </Dialog>
    </div>
  );
});

ProductList.displayName = 'ProductList';

export default ProductList;
