export function HowToPlay() {
    return (
        <div className="bg-transparent border-[5px] border-black rounded-2xl w-full h-full p-6 text-slate-800">
            <div className="mb-4 text-center">
                <h4
                    className="text-black"
                    style={{
                        fontFamily: 'var(--font-lilita-one)',
                        fontWeight: 400,
                        fontStyle: 'normal',
                        fontSize: '16px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                    }}
                >
                    HOW TO PLAY
                </h4>
            </div>
            <ul className="space-y-2 list-disc pl-6 text-xs leading-tight">
                <li>📰 Each turn, <strong>Breaking News</strong> changes Fees and Share Prices.</li>
                <li>🎲 Choose: <strong>ROLL</strong> or <strong>SELL shares</strong> (then ROLL).</li>
                <li>💸 Pay the <strong>Fee</strong> when you stop — shareholders get the payout.</li>
                <li>🛒 Buy shares after moving. Each company has up to <strong>3 shares</strong>.</li>
                <li>🎯 Don&apos;t go broke! Highest <strong>Net Worth</strong> after 15 turns wins.</li>
            </ul>
        </div>
    );
}
