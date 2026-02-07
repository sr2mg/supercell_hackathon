export function HowToPlay() {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-xs text-slate-500">
            <h4 className="font-bold mb-2 text-slate-700">How to Play</h4>
            <ul className="space-y-1 list-disc pl-4">
                <li>Roll dice to move around the loop.</li>
                <li>Every 3 turns, <strong>World News</strong> changes property values or rents.</li>
                <li>Buy properties to bankrupt your opponent.</li>
                <li>Watch out for News Alerts!</li>
            </ul>
        </div>
    );
}
