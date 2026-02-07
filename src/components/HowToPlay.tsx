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
                <li>Roll dice to move around the loop.</li>
                <li>Every 3 turns, <strong>World News</strong> changes property values or rents.</li>
                <li><strong>D</strong> means the fee/dividend (example: <strong>D250</strong>).</li>
                <li>Buy shares to earn dividends and outlast your opponents.</li>
            </ul>
        </div>
    );
}
