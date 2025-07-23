"use client"
import React from 'react';
import SurveyWizard from './components/SurveyWizard';
import { useSearchParams } from "next/navigation";

function PermissionPage() {
  return (
    <div>
      <SurveyWizard/>
    </div>
  )
}

export default PermissionPage
