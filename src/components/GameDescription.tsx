'use client';

export function GameDescription() {
    return (
        <div className="w-full max-w-[1100px] mx-auto bg-[#efede6] p-10">
            {/* Two Column Layout */}
            <div className="flex flex-col lg:flex-row gap-10">
                {/* Left Column */}
                <div className="lg:w-[380px] space-y-5 lg:pr-10 lg:border-r lg:border-black">
                    {/* IMPORTANT Logo */}
                    <div className="mb-4">
                        <img
                            src="/IMPORTANT.svg"
                            alt="IMPORTANT"
                            className="h-24 w-auto"
                        />
                    </div>

                    {/* HOW TO PLAY Title with double border */}
                    <div className="pb-4 border-b-[3px] border-black border-double">
                        <h2
                            className="text-4xl font-bold text-black tracking-tight"
                            style={{ fontFamily: 'var(--font-playfair-display)' }}
                        >
                            HOW TO PLAY
                        </h2>
                    </div>

                    {/* Description */}
                    <p
                        className="text-lg text-black/80 leading-relaxed"
                        style={{ fontFamily: 'var(--font-playfair-display)' }}
                    >
                        News moves the market. Buy shares, collect fees, survive the chaos.
                    </p>

                    {/* Goal Section */}
                    <div className="space-y-2">
                        <h3
                            className="text-xl font-semibold text-black"
                            style={{ fontFamily: 'var(--font-playfair-display)' }}
                        >
                            🎯 Goal
                        </h3>
                        <p
                            className="text-black/80 leading-relaxed text-base"
                            style={{ fontFamily: 'var(--font-playfair-display)' }}
                        >
                            Don&apos;t go broke.
                            <br />
                            Be the last player standing, or have the highest Net Worth after 15 turns.
                        </p>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex-1 space-y-6 lg:pl-2">
                    {/* Breaking News Section */}
                    <div className="space-y-2">
                        <h3
                            className="text-xl font-semibold text-black"
                            style={{ fontFamily: 'var(--font-playfair-display)' }}
                        >
                            📰 Breaking News (Every Turn)
                        </h3>
                        <p
                            className="text-black/80 leading-relaxed text-base"
                            style={{ fontFamily: 'var(--font-playfair-display)' }}
                        >
                            At the start of each turn, a real news headline hits the market.
                            <br />
                            It affects one sector: AI / CHIPS / ENERGY / GOV / CRYPTO / MEDIA
                            <br />
                            This changes: Fees and Share Prices.
                        </p>
                    </div>

                    {/* On Your Turn Section */}
                    <div className="space-y-2">
                        <h3
                            className="text-xl font-semibold text-black"
                            style={{ fontFamily: 'var(--font-playfair-display)' }}
                        >
                            🎲 On Your Turn
                        </h3>
                        <p
                            className="text-black/80 leading-relaxed text-base"
                            style={{ fontFamily: 'var(--font-playfair-display)' }}
                        >
                            Choose: ROLL or SELL shares (then ROLL).
                        </p>
                    </div>

                    {/* When You Stop Section */}
                    <div className="space-y-2">
                        <h3
                            className="text-xl font-semibold text-black"
                            style={{ fontFamily: 'var(--font-playfair-display)' }}
                        >
                            💸 When You Stop on a Company
                        </h3>
                        <p
                            className="text-black/80 leading-relaxed text-base"
                            style={{ fontFamily: 'var(--font-playfair-display)' }}
                        >
                            You must pay its current Fee.That money is distributed to shareholders(more shares = bigger payout).
                        </p>
                    </div>

                    {/* Shares Section */}
                    <div className="space-y-2">
                        <h3
                            className="text-xl font-semibold text-black"
                            style={{ fontFamily: 'var(--font-playfair-display)' }}
                        >
                            🛒 Shares
                        </h3>
                        <p
                            className="text-black/80 leading-relaxed text-base"
                            style={{ fontFamily: 'var(--font-playfair-display)' }}
                        >
                            After moving, you may buy shares of the company you stopped on.
                            <br />
                            Share price depends on the current market.
                            <br />
                            Each company has up to 3 shares total.
                            <br />
                            You can sell shares at the start of your turn.
                            <br />
                            Sell price = current share price.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
