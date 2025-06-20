import React from "react";
import { Card } from "primereact/card";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { FileUpload } from "primereact/fileupload";
import { Image } from "primereact/image";
import { Button } from "primereact/button";

const DamageReportForm = ({ damageReport, damagedProducts, onChange }) => {
  const responsibilityOptions = [
    { label: "Customer", value: "customer" },
    { label: "Internal", value: "internal" },
    { label: "Unknown", value: "unknown" }
  ];

  const handlePhotoUpload = (event) => {
    const files = event.files;
    const photos = [...damageReport.photos];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        photos.push({
          name: file.name,
          url: e.target.result,
          size: file.size
        });
        onChange({ ...damageReport, photos });
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    const photos = [...damageReport.photos];
    photos.splice(index, 1);
    onChange({ ...damageReport, photos });
  };

  return (
    <div className="damage-report-form">
      <Card className="mb-4">
        <h4 className="font-semibold mb-3">Damaged Items</h4>
        <div className="space-y-2">
          {damagedProducts.map((product, index) => (
            <div key={index} className="p-3 bg-red-50 rounded">
              <p className="font-medium">{product.productName}</p>
              <p className="text-sm text-gray-600">{product.damageDescription}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">
            Overall Damage Description <span className="text-red-500">*</span>
          </label>
          <InputTextarea
            value={damageReport.description}
            onChange={(e) => onChange({ ...damageReport, description: e.target.value })}
            rows={4}
            className="w-full"
            placeholder="Provide a detailed description of all damage..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">
              Responsibility <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={damageReport.responsibility}
              options={responsibilityOptions}
              onChange={(e) => onChange({ ...damageReport, responsibility: e.value })}
              placeholder="Assign responsibility"
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Damage Photos</label>
            <FileUpload
              mode="basic"
              accept="image/*"
              maxFileSize={5000000}
              onSelect={handlePhotoUpload}
              auto
              chooseLabel="Upload Photos"
              className="w-full"
            />
          </div>
        </div>

        {damageReport.photos.length > 0 && (
          <div>
            <label className="block mb-2 font-medium">Uploaded Photos</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {damageReport.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <Image
                    src={photo.url}
                    alt={photo.name}
                    width="100%"
                    height="100px"
                    className="rounded"
                    preview
                  />
                  <Button
                    icon="pi pi-times"
                    className="absolute top-1 right-1"
                    rounded
                    text
                    severity="danger"
                    size="small"
                    onClick={() => removePhoto(index)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <Card className="bg-gray-50">
          <div className="space-y-3">
            <div className="flex items-center">
              <Checkbox
                checked={damageReport.chargeCustomer}
                onChange={(e) => onChange({ ...damageReport, chargeCustomer: e.checked })}
                inputId="chargeCustomer"
              />
              <label htmlFor="chargeCustomer" className="ml-2 font-medium">
                Charge customer for damage
              </label>
            </div>

            {damageReport.chargeCustomer && (
              <div>
                <label className="block mb-2 text-sm">Damage Charge Amount (£)</label>
                <InputNumber
                  value={damageReport.damageCharge}
                  onValueChange={(e) => onChange({ ...damageReport, damageCharge: e.value || 0 })}
                  mode="currency"
                  currency="GBP"
                  locale="en-GB"
                  className="w-full"
                />
                <p className="text-xs text-gray-600 mt-1">
                  This amount will be added to the final invoice
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DamageReportForm;