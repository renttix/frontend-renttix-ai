import React, { useRef, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { closeModal } from "@/store/modalSlice";
import { BaseURL, imageBaseURL } from "../../../../utils/baseUrl";

const AllocatedModel = ({onAllocate }) => {
  const toast = useRef();
  const dispatch = useDispatch();
  const { modelOpen, modalData } = useSelector((s) => s.modal);
  const { token } = useSelector((s) => s.authReducer);

  const product = modalData?.productData;
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const headerElement = (
    <div className="inline-flex gap-2 items-center">
      <strong>
        {modalData?.revert ? "Revert" : "Allocate"} {product?.productName}
      </strong>
    </div>
  );

  const footerContent = (
    <Button
      disabled={value > modalData?.quantityProduct}
      loading={loading}
      label={modalData?.revert ? "Revert" : "Apply"}
      // onClick={async () => {
      //   setLoading(true);
      //   try {
      //     const payload = {
      //       orderId: modalData?.orderId,
      //       productItemId: modalData?.productItemId,
      //       quantity: modalData?.revert
      //         ? modalData?.quantityProduct
      //         : value,
      //       revert: !!modalData?.revert,
      //     };

      //     // **Call the status-update API:**
      //     const res = await axios.put(
      //       `${BaseURL}/order/product/status`,
      //       payload,
      //       {
      //         headers: {
      //           "Content-Type": "application/json",
      //           authorization: `Bearer ${token}`,
      //         },
      //       }
      //     );

      //     if (res.data.success) {
      //       toast.current.show({
      //         severity: "success",
      //         summary: "Success",
      //         detail: res.data.message,
      //       });
      //     } else {
      //       toast.current.show({
      //         severity: "error",
      //         summary: "Failed",
      //         detail: res.data.message,
      //       });
      //     }
      //   } catch (err) {
      //     toast.current.show({
      //       severity: "error",
      //       summary: "Error",
      //       detail: err.response?.data?.message || err.message,
      //     });
      //   } finally {
      //     setLoading(false);
      //     dispatch(closeModal());
      //   }
      // }}
      onClick={async () => {
        setLoading(true);
        const res = await onAllocate({
          productItemId: modalData.productItemId,
          quantity: value,
          revert: !!modalData.revert,
        });
        setValue(0)
        setLoading(false);
        if (res.data.success) dispatch(closeModal());
               if (res.data.success) {
            toast.current.show({
              severity: "success",
              summary: "Success",
              detail: res.data.message,
            });
          } else {
            toast.current.show({
              severity: "error",
              summary: "Failed",
              detail: res.data.message,
            });
          }
      }}
    
    />
  );

  return (
    <div className="flex justify-center">
      <Toast ref={toast} />

      <Dialog
        visible={modelOpen}
        modal
        header={headerElement}
        footer={footerContent}
        style={{ width: "50rem" }}
        onHide={() => dispatch(closeModal())}
      >
        {modalData?.revert ? (
          <p>
            Are you sure you want to revert{" "}
            <strong>{product?.productName}</strong>?
          </p>
        ) : (
          <>
            <DataTable value={product ? [product] : []} className="p-datatable-sm">
              <Column
                header="Product"
                body={() => (
                  <div className="flex items-center gap-3">
                    <img
                      src={`${imageBaseURL}${product.images?.[0]}`}
                      alt={product.productName}
                      className="h-13 w-13 rounded"
                      onError={(e) =>
                        (e.currentTarget.src =
                          "/images/product/placeholder.webp")
                      }
                    />
                    <span>{product.productName}</span>
                  </div>
                )}
              />
              <Column field="status" header="Status" />
              <Column field="quantity" header="Available" />
              <Column
                header="Allocate?"
                body={() => (
                  <InputText
                    type="number"
                    defaultValue={0}
                    onChange={(e) => setValue(+e.target.value)}
                    className="p-inputtext-sm"
                  />
                )}
              />
            </DataTable>

            <div className="flex justify-end p-5">
              <Tag
                severity={
                  value > modalData?.quantityProduct ? "danger" : "success"
                }
                value={
                  value <= modalData?.quantityProduct
                    ? `${modalData?.quantityProduct - value} items left`
                    : `${value - modalData?.quantityProduct} over-allocated`
                }
              />
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default AllocatedModel;
