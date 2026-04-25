import Button from "../../components/Button";

export default function EndScreen({
  result,
  reason,
  onClose,
}: {
  result: string;
  reason: string;
  onClose: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 text-center shadow-sm shadow-slate-200/40">
      <div className="space-y-2">
        <p className="text-lg font-semibold text-slate-900">Result: {result}</p>
        <p className="text-sm text-slate-600">Reason: {reason}</p>
      </div>
      <Button onClick={onClose} className="px-6 py-2">
        Close
      </Button>
    </div>
  );
}
