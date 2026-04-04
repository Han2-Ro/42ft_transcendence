import Button from "../../componets/Button";

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
    <div style={{ textAlign: "center" }}>
      <p>Result: {result}</p>
      <p>Reason: {reason}</p>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
}
