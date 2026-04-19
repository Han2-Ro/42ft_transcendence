"use client";

import Button from "@/componets/Button";
import ErrorMessage from "@/componets/ErrorMessage";
import { Popup } from "@/componets/Popup";
import { TextInput } from "@/componets/TextInput";
import { setup2FA, verify2FA } from "@/lib/auth/actions";
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
  };

  const submit2FASetup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const verificationCode =
      (formData.get("verificationCode") as string | null)?.trim() ?? "";

    if (!verificationCode) {
      setError("Verification code is required");
      setLoading(false);
      return;
    }

    const verifyResult = await verify2FA(verificationCode);
    if (!verifyResult.success) {
      setError(verifyResult.error);
      setLoading(false);
      return;
    }

    setChecked2FA(true);
    setLoading(false);
    setShowDialog(false);
  };

  return (
    <>
      {showDialog && (
        <Popup
          className="p-4 w-64 lg:w-96"
          onClose={() => setShowDialog(false)}
        >
          <h2 className="text-3xl mb-8">Setup 2FA</h2>
          <p className="mb-8">
            Scan the QR Code with your Authenitcator App and enter the 6 digit
            code below.
          </p>
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
          <form onSubmit={submit2FASetup}>
            <TextInput
              id="verificationCode"
              name="verificationCode"
              label="Verification Code"
              required
              disabled={loading}
              className="mt-4"
            />
            <ErrorMessage className="mt-4" errorMsg={error} />
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
          </form>
        </Popup>
      )}
      <div className="flex flex-row justify-between items-center p-2 w-full">
        <p>Enable 2FA</p>
        <input
          type="checkbox"
          checked={checked2FA}
          onChange={toggle2FA}
          className="mr-18 w-5 h-5 accent-accent-primary"
        />
      </div>
    </>
  );
}
