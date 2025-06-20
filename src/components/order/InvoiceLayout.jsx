// components/InvoiceLayout.jsx
"use client";

import React from "react";
import moment from "moment";
import { Button } from "primereact/button";
import { imageBaseURL } from "../../../utils/baseUrl";
import { formatCurrency } from "../../../utils/helper";
import PaymentPay from "../system-setup/subscription-billing/PaymentPay";

function InvoiceCard({
  title,
  data,
  user,
  loader,
  onBack,
  onDownload,
  onPay,            // only for rental (DN) or RN if you want
  showPayButton,    // boolean
}) {
  const isRentalSection = title.toLowerCase().includes("rental");
  const isSaleSection   = title.toLowerCase().includes("sales");
  const products        = data.products;

  return (
    <div className="max-w-5xl mx-auto mb-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden print:bg-white">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-700 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img
            src={`${imageBaseURL}${user.brandLogo}`}
            alt="Logo"
            className="h-12 object-contain"
          />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {title}
          </h2>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Date
          </div>
          <div className="text-lg font-medium text-gray-800 dark:text-gray-100">
            {moment(data.invoiceDate).format("DD MMM YYYY")}
          </div>
          <div className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-100">
            #{data.invoiceNumber}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-6 space-y-8">
        {/* Addresses & Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Billing */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Bill To
            </h3>
            <p className="mt-1 font-medium text-gray-800 dark:text-gray-200">
              {data.customerName}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {data.customerAddress}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {data.customerCity}, {data.customerCountry} {data.customerPostCode}
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Email: {data.customerEmail}
            </p>
          </div>

          {/* Order */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Order Details
            </h3>
            <p className="mt-1 text-gray-800 dark:text-gray-200">
              <span className="font-medium">Order #:</span> {data.orderNumber}
            </p>
            {data.returnNote ? (
              <p className="text-gray-600 dark:text-gray-400">
                Return Note: {data.returnNote}
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Delivery Note: {data.deliveryNote}
              </p>
            )}
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              <span className="font-medium">Order:</span>{" "}
              {moment(data.orderDate).format("DD MMM YYYY")}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Delivery:</span>{" "}
              {moment(data.deliveryDate).format("DD MMM YYYY")}
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Place: {data.deliveryPlaceName}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-center">Qty</th>
                <th className="px-4 py-2 text-center">Status</th>

                {/* Rental-only columns */}
                {isRentalSection && (
                  <>
                    <th className="px-4 py-2 text-center">
                      Min. Rental
                    </th>
                    <th className="px-4 py-2 text-center">
                      Weeks / Days
                    </th>
                  </>
                )}

                {/* Sale-only columns */}
                {isSaleSection && (
                  <>
                    <th className="px-4 py-2 text-right">Unit Price</th>
                    <th className="px-4 py-2 text-right">Tax (%)</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {products?.map((item, i) => (
                <tr
                  key={i}
                  className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <td className="px-4 py-3">{item.productName}</td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-center">{item.type}</td>

                  {isRentalSection && (
                    <>
                      <td className="px-4 py-3 text-center">
                        {item.minimumRentalPeriod ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.weeks ?? "-"} / {item.days ?? "-"}
                      </td>
                    </>
                  )}

                  {isSaleSection && (
                    <>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(item.price, user.currencyKey)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.vat}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(item.total, user.currencyKey)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Additional / Suspension Charges */}
        {data.collectionChargeAmount !== 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              A{" "}
              {data?.invoiceNumber?.startsWith("DN")
                ? "delivery"
                : "collection"}{" "}
              fee of{" "}
              {formatCurrency(
                data.collectionChargeAmount,
                user.currencyKey
              )}{" "}
              may apply.
            </p>
          </div>
        )}

        {data.suspension &&
          data.totalPriceSuspension !== "0.00$" && (
            <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                {data.suspension.reason}
                <br />
                No charges from{" "}
                {moment(data.suspension.dateRange[0]).format(
                  "DD MMM YYYY"
                )}{" "}
                to{" "}
                {moment(data.suspension.dateRange[1]).format(
                  "DD MMM YYYY"
                )}
                .<br />
                Suspension: {data.totalPriceSuspension}
              </p>
            </div>
          )}

        {/* Totals */}
        <div className="flex justify-end mt-8">
          <div className="w-full lg:w-1/3 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                Subtotal
              </span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {formatCurrency(data.totalPrice, user.currencyKey)}
              </span>
            </div>
            {isSaleSection && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {formatCurrency(data.vatTotal, user.currencyKey)}
                </span>
              </div>
            )}
            <div className="border-t border-gray-300 dark:border-gray-600 mt-2 pt-2 flex justify-between">
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                Total
              </span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {formatCurrency(
                  data.vattotalPrice ?? data.totalPrice,
                  user.currencyKey
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Payment:</span> Due{" "}
          {data.paymentTerms} days from invoice date.
        </p>
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-100 dark:bg-gray-700 px-8 py-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <Button
          onClick={onBack}
          label="Back"
          icon="pi pi-arrow-left"
          className="p-button-text"
        />

        <div className="flex items-center space-x-4">
          {showPayButton && onPay && (
            <PaymentPay
              email={data.customerEmail}
              customerId={data.customerId}
              orderId={data.order_Id}
              amount={Number(data.vattotalPrice)}
            />
          )}
          <Button
            label={loader ? "Downloading..." : "Download"}
            icon="pi pi-download"
            onClick={onDownload}
            disabled={loader}
            className="p-button-success"
          />
        </div>
      </div>
    </div>
  );
}

export default function InvoiceLayout({
  data,
  user,
  loader,
  onBack,
  onDownloadDelivery,  // for DN → rental
  onDownloadSale,      // for DN → sale
  onDownloadDefault,   // for RN or single
}) {
  const isDN = data.invoiceNumber?.startsWith("DN");
  const isRN = data.invoiceNumber?.startsWith("RN");

  if (isDN) {
    // split products
    const rentalItems = data.products.filter((p) => p.type === "Rental");
    const saleItems   = data.products.filter((p) => p.type === "Sale");

    const rentalData = { ...data, products: rentalItems };
    const saleData   = { ...data, products: saleItems   };

    return (
      <div className="space-y-16 print:space-y-0">
        <InvoiceCard
          title="Rental Invoice"
          data={rentalData}
          user={user}
          loader={loader}
          onBack={onBack}
          showPayButton={false}
          onDownload={onDownloadDelivery}
        />

        <InvoiceCard
          title="Sales Invoice"
          data={saleData}
          user={user}
          loader={loader}
          onBack={onBack}
          showPayButton={false}
          onDownload={onDownloadSale}
        />
      </div>
    );
  }

  // RN or SN single invoice
  return (
    <InvoiceCard
      title={isRN ? "Return Invoice" : "Invoice"}
      data={data}
      user={user}
      loader={loader}
      onBack={onBack}
      showPayButton={isRN}
      onPay={isRN ? onDownloadDefault /*or a payment handler*/ : null}
      onDownload={onDownloadDefault}
    />
  );
}
