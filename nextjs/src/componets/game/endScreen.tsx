export default function EndScreen({ result, reason, onClose}) {

  return (
	<div style={{ textAlign: "center" }}>
		<p>Result: {result}</p>
		<p>Reason: {reason}</p>
		<button
		onClick={onClose}
		style={{
		  padding: "10px 20px",
		  fontSize: "20px",
		  cursor: "pointer",
		}}
	  >
		close
	  </button>
	</div>
  );
}