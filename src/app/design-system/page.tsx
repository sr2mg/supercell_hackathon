"use client";

import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import { Callout } from "@/components/ui/Callout";
import { BoardTile } from "@/components/ui/BoardTile";

export default function DesignSystemPage() {
    return (
        <div className="min-h-screen p-8 text-black">
            <h1 className="mb-8 font-display text-4xl font-bold">Design System</h1>

            <section className="mb-12">
                <h2 className="mb-4 font-display text-2xl">Colors</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="h-24 rounded-lg bg-ink-black p-4 text-white">Ink Black #111111</div>
                    <div className="h-24 rounded-lg bg-paper-white p-4">Paper White #F6F1EF</div>
                    <div className="h-24 rounded-lg bg-hot-pink p-4">Hot Pink #F3A3C7</div>
                    <div className="h-24 rounded-lg bg-coral-orange p-4">Coral Orange #E86C3A</div>
                    <div className="h-24 rounded-lg bg-sunny-yellow p-4">Sunny Yellow #F2C94C</div>
                    <div className="h-24 rounded-lg bg-teal-green p-4 text-white">Teal Green #2F6E63</div>
                    <div className="h-24 rounded-lg bg-bright-blue p-4 text-white">Bright Blue #4C78C9</div>
                    <div className="h-24 rounded-lg bg-lavender p-4">Lavender #C7A3E6</div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="mb-4 font-display text-2xl">Typography</h2>
                <div className="space-y-4">
                    <p className="font-display text-5xl">Display Font (Rammetto One)</p>
                    <p className="font-sans text-lg">
                        Body Font (Inter). The quick brown fox jumps over the lazy dog.
                    </p>
                    <p className="font-sans text-sm font-bold">
                        Bold Body Text. Education is not the filling of a pail, but the lighting of a fire.
                    </p>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="mb-4 font-display text-2xl">Buttons</h2>
                <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary Action</Button>
                    <Button variant="secondary">Secondary Action</Button>
                    <Button variant="outline">Outline Action</Button>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="mb-4 font-display text-2xl">Tags & Pills</h2>
                <div className="flex flex-wrap gap-2">
                    <Tag color="pink">#BreakingNews</Tag>
                    <Tag color="yellow">#Update</Tag>
                    <Tag color="blue">#Business</Tag>
                    <Tag color="green">#Environment</Tag>
                    <Tag color="orange">#Opinion</Tag>
                    <Tag color="lavender">#Culture</Tag>
                    <Tag color="white">#Default</Tag>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="mb-4 font-display text-2xl">Callouts</h2>
                <div className="grid gap-8 md:grid-cols-2">
                    <Callout direction="left">
                        <p className="font-bold">Breaking News!</p>
                        <p className="text-sm">Something important just happened in the market.</p>
                    </Callout>
                    <Callout direction="right">
                        <p className="font-bold">Did you know?</p>
                        <p className="text-sm">You can trade properties during your turn.</p>
                    </Callout>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="mb-4 font-display text-2xl">Cards</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <h3 className="mb-2 font-display text-xl">Property Card</h3>
                        <p className="text-sm">Standard card with shadow and border.</p>
                    </Card>
                    <Card className="bg-sunny-yellow">
                        <h3 className="mb-2 font-display text-xl">Event Card</h3>
                        <p className="text-sm">Colored card variant.</p>
                    </Card>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="mb-4 font-display text-2xl">Board Tiles</h2>
                <div className="flex flex-wrap gap-4">
                    <BoardTile color="pink" className="w-24">
                        <span>GO</span>
                        <span className="text-lg">➔</span>
                    </BoardTile>
                    <BoardTile color="blue" className="w-24">
                        <span>Tech</span>
                        <span>$200</span>
                    </BoardTile>
                    <BoardTile color="white" className="w-24">
                        <span>Chance</span>
                        <span>?</span>
                    </BoardTile>
                </div>
            </section>
        </div>
    );
}
