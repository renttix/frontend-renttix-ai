"use client";
import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { useSelector } from "react-redux";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";

export default function DamageWaiverSetup() {
  const { token, user } = useSelector((state) => state?.authReducer);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLevelDialog, setShowLevelDialog] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [settings, setSettings] = useState({
    damageWaiverEnabled: false,
    taxCode: "",
    nominalCode: "",
    damageWaiverTaxable: false,
    damageWaiverTaxRate: 20,
    damageWaiverLevels: []
  });
  const [newLevel, setNewLevel] = useState({
    name: "",
    description: "",
    rate: 0
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchDamageWaiverSettings();
  }, []);

  const fetchDamageWaiverSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BaseURL}/damage-waiver/settings`, {
        headers: { authorization: `Bearer ${token}` },
        params: { vendorId: user._id }
      });

      if (response.data.success) {
        setSettings(response.data.data || {
          damageWaiverEnabled: false,
          taxCode: "",
          nominalCode: "",
          damageWaiverTaxable: false,
          damageWaiverTaxRate: 20,
          damageWaiverLevels: []
        });
      }
    } catch (error) {
      console.error("Failed to fetch damage waiver settings:", error);
      // Set default settings if none exist
      setSettings({
        damageWaiverEnabled: false,
        taxCode: "",
        nominalCode: "",
        damageWaiverTaxable: false,
        damageWaiverTaxRate: 20,
        damageWaiverLevels: []
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setErrors({});
      setSuccess("");

      // Validate required fields if damage waiver is enabled
      if (settings.damageWaiverEnabled) {
        const newErrors = {};

        if (!settings.taxCode.trim()) {
          newErrors.taxCode = "Tax code is required";
        }

        if (!settings.nominalCode.trim()) {
          newErrors.nominalCode = "Nominal code is required";
        }

        if (settings.damageWaiverLevels.length === 0) {
          newErrors.levels = "At least one damage waiver level is required";
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }
      }

      const response = await axios.post(`${BaseURL}/damage-waiver/settings`, {
        ...settings,
        vendorId: user._id
      }, {
        headers: { authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess("Damage waiver settings saved successfully!");
        await fetchDamageWaiverSettings(); // Refresh data
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      setErrors({ general: "Failed to save settings. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const openAddLevelDialog = () => {
    setNewLevel({ name: "", description: "", rate: 0 });
    setEditingLevel(null);
    setShowLevelDialog(true);
  };

  const openEditLevelDialog = (level) => {
    setNewLevel({
      name: level.name,
      description: level.description,
      rate: level.rate
    });
    setEditingLevel(level);
    setShowLevelDialog(true);
  };

  const saveLevel = () => {
    const levelErrors = {};

    if (!newLevel.name.trim()) {
      levelErrors.name = "Level name is required";
    }

    if (!newLevel.description.trim()) {
      levelErrors.description = "Description is required";
    }

    if (newLevel.rate <= 0) {
      levelErrors.rate = "Rate must be greater than 0";
    }

    if (Object.keys(levelErrors).length > 0) {
      setErrors(levelErrors);
      return;
    }

    if (editingLevel) {
      // Update existing level
      setSettings(prev => ({
        ...prev,
        damageWaiverLevels: prev.damageWaiverLevels.map(level =>
          level.id === editingLevel.id
            ? { ...level, ...newLevel }
            : level
        )
      }));
    } else {
      // Add new level
      const levelId = `dw-level-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setSettings(prev => ({
        ...prev,
        damageWaiverLevels: [
          ...prev.damageWaiverLevels,
          {
            id: levelId,
            ...newLevel
          }
        ]
      }));
    }

    setShowLevelDialog(false);
    setErrors({});
  };

  const deleteLevel = (levelId) => {
    if (confirm("Are you sure you want to delete this damage waiver level?")) {
      setSettings(prev => ({
        ...prev,
        damageWaiverLevels: prev.damageWaiverLevels.filter(level => level.id !== levelId)
      }));
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => openEditLevelDialog(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger p-button-sm"
          onClick={() => deleteLevel(rowData.id)}
        />
      </div>
    );
  };

  const rateBodyTemplate = (rowData) => {
    return <span>{rowData.rate}%</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Damage Waiver Setup</h2>
        <p className="text-gray-600">
          Configure damage waiver settings for your rental equipment
        </p>
      </div>

      {errors.general && <Message severity="error" text={errors.general} />}
      {success && <Message severity="success" text={success} />}

      <Card>
        <div className="space-y-6">
          {/* Enable/Disable Damage Waiver */}
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="damageWaiverEnabled"
              checked={settings.damageWaiverEnabled}
              onChange={(e) => handleSettingChange('damageWaiverEnabled', e.checked)}
            />
            <label htmlFor="damageWaiverEnabled" className="text-lg font-medium cursor-pointer">
              Enable Damage Waiver
            </label>
          </div>

          {/* Settings Panel - Only show if enabled */}
          {settings.damageWaiverEnabled && (
            <div className="space-y-6 pl-6 border-l-2 border-blue-200">
              {/* Tax and Accounting Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Tax & Accounting Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tax Code <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      value={settings.taxCode}
                      onChange={(e) => handleSettingChange('taxCode', e.target.value)}
                      placeholder="e.g., T20"
                      className={`w-full ${errors.taxCode ? 'p-invalid' : ''}`}
                    />
                    {errors.taxCode && <small className="text-red-500">{errors.taxCode}</small>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nominal Code <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      value={settings.nominalCode}
                      onChange={(e) => handleSettingChange('nominalCode', e.target.value)}
                      placeholder="e.g., NOM001"
                      className={`w-full ${errors.nominalCode ? 'p-invalid' : ''}`}
                    />
                    {errors.nominalCode && <small className="text-red-500">{errors.nominalCode}</small>}
                  </div>
                </div>

                {/* Taxable Settings */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      inputId="damageWaiverTaxable"
                      checked={settings.damageWaiverTaxable}
                      onChange={(e) => handleSettingChange('damageWaiverTaxable', e.checked)}
                    />
                    <label htmlFor="damageWaiverTaxable" className="cursor-pointer">
                      Damage waiver is taxable
                    </label>
                  </div>

                  {settings.damageWaiverTaxable && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Damage Waiver Tax Rate (%)
                      </label>
                      <InputNumber
                        value={settings.damageWaiverTaxRate}
                        onValueChange={(e) => handleSettingChange('damageWaiverTaxRate', e.value)}
                        min={0}
                        max={100}
                        step={0.01}
                        suffix="%"
                        className="w-full md:w-64"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Damage Waiver Levels */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Damage Waiver Levels <span className="text-red-500">*</span>
                  </h3>
                  <Button
                    label="Add Level"
                    icon="pi pi-plus"
                    onClick={openAddLevelDialog}
                    className="p-button-sm"
                  />
                </div>

                {errors.levels && <Message severity="error" text={errors.levels} className="mb-4" />}

                {settings.damageWaiverLevels.length > 0 ? (
                  <DataTable value={settings.damageWaiverLevels} className="p-datatable-sm">
                    <Column field="name" header="Level Name" />
                    <Column field="description" header="Description" />
                    <Column field="rate" header="Rate" body={rateBodyTemplate} />
                    <Column body={actionBodyTemplate} header="Actions" style={{ width: '120px' }} />
                  </DataTable>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="pi pi-info-circle text-2xl mb-2"></i>
                    <p>No damage waiver levels configured</p>
                    <p className="text-sm">Add at least one level to enable damage waiver</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          label="Save Settings"
          icon="pi pi-save"
          onClick={saveSettings}
          loading={saving}
          className="px-6"
        />
      </div>

      {/* Level Dialog */}
      <Dialog
        header={editingLevel ? "Edit Damage Waiver Level" : "Add Damage Waiver Level"}
        visible={showLevelDialog}
        onHide={() => setShowLevelDialog(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setShowLevelDialog(false)}
            />
            <Button
              label="Save"
              icon="pi pi-check"
              onClick={saveLevel}
            />
          </div>
        }
        className="w-full md:w-96"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Level Name <span className="text-red-500">*</span>
            </label>
            <InputText
              value={newLevel.name}
              onChange={(e) => setNewLevel(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Standard Coverage"
              className={`w-full ${errors.name ? 'p-invalid' : ''}`}
            />
            {errors.name && <small className="text-red-500">{errors.name}</small>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={newLevel.description}
              onChange={(e) => setNewLevel(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this level covers"
              className={`w-full p-2 border rounded ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              rows={3}
            />
            {errors.description && <small className="text-red-500">{errors.description}</small>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Rate Percentage <span className="text-red-500">*</span>
            </label>
            <InputNumber
              value={newLevel.rate}
              onValueChange={(e) => setNewLevel(prev => ({ ...prev, rate: e.value || 0 }))}
              min={0}
              max={100}
              step={0.01}
              suffix="%"
              placeholder="e.g., 10"
              className={`w-full ${errors.rate ? 'p-invalid' : ''}`}
            />
            {errors.rate && <small className="text-red-500">{errors.rate}</small>}
          </div>
        </div>
      </Dialog>
    </div>
  );
}