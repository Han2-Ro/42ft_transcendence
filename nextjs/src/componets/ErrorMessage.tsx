export default function ErrorMessage({
  errorMsg,
  className = "",
}: {
  errorMsg: string;
  className?: string;
}) {
  return (
    <>
      {errorMsg && (
        <div
          className={`mb-4 p-2 bg-red-500/20 text-red-500 rounded ${className}`}
        >
          {errorMsg}
        </div>
      )}
    </>
  );
}
