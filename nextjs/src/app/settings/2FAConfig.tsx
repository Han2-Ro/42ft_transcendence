"use client";

import Button from "@/componets/Button";
import ErrorMessage from "@/componets/ErrorMessage";
import { Popup } from "@/componets/Popup";
import { TextInput } from "@/componets/TextInput";
import { setup2FA } from "@/lib/auth/actions";
import Image from "next/image";
import { useState } from "react";

export default function Config2FA() {
  const [checked2FA, setChecked2FA] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle2FA = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      console.log("setting up 2FA...");
      setShowDialog(true);
      const setupResult = await setup2FA();
      if (!setupResult.success) {
        setError(setupResult.error);
        return;
      }
      setQrCode(setupResult.data);
    } else {
      console.log("disabling 2FA...");
    }
    setChecked2FA(isChecked);
  };

  return (
    <>
      {showDialog && (
        <Popup className="p-4" onClose={() => setShowDialog(false)}>
          <h2 className="text-3xl mb-8">Setup 2FA</h2>
          {qrCode ? (
            <img
              className="mx-auto"
              src={qrCode}
              alt="QR code to set up two-factor authentication in your
 authenticator app"
            />
          ) : (
            <p>Generating QR code...</p>
          )}
          <TextInput
            id="verificationCode"
            name="verificationCode"
            label="Verification Code"
            required
            disabled={loading}
            className="mt-8"
          />
          <ErrorMessage className="mt-8" errorMsg={error} />
          <div className="flex flex-row mt-8 gap-4">
            <Button
              className="flex-1 bg-background-primary"
              type="button"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </Popup>
      )}
      <div className="flex flex-row justify-between items-center p-2 w-full">
        <p>Enable 2FA</p>
        <input
          type="checkbox"
          checked={checked2FA}
          onChange={toggle2FA}
        ></input>
      </div>
    </>
  );
}
