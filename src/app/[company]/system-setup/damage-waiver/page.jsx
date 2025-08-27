"use client";
import React from "react";
import { Card } from "primereact/card";
import DamageWaiverSetup from "../../../../components/system-setup/damage-waiver/DamageWaiverSetup";

export default function DamageWaiverSetupPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Damage Waiver Setup</h1>
        <p className="text-gray-600">
          Configure damage waiver settings for your rental equipment
        </p>
      </div>

      <Card className="max-w-4xl">
        <DamageWaiverSetup />
      </Card>
    </div>
  );
}