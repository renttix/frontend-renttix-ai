// Debug component to help troubleshoot signature pad issues
const DebugSignatureState = ({ hasSignature, fullName, signature }) => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
      <h4 className="font-bold text-yellow-800 mb-2">🔧 Debug Info (Dev Only)</h4>
      <div className="space-y-1 text-yellow-700">
        <div><strong>hasSignature:</strong> {hasSignature ? '✅ TRUE' : '❌ FALSE'}</div>
        <div><strong>fullName:</strong> "{fullName.trim()}" (length: {fullName.trim().length})</div>
        <div><strong>Signature exists:</strong> {signature ? '✅ YES' : '❌ NO'} ({signature?.length || 0} chars)</div>
        <div><strong>Can sign document:</strong> {(hasSignature && fullName.trim().length > 0) ? '✅ YES' : '❌ NO'}</div>
      </div>
      {(!hasSignature || !fullName.trim()) && (
        <div className="mt-2 text-xs text-red-600">
          {!hasSignature && "🤔 Why? You need to sign on the pad above"}
          {hasSignature && fullName.trim().length === 0 && "🤔 Why? Enter your full name"}
        </div>
      )}
    </div>
  );
};

export default DebugSignatureState;