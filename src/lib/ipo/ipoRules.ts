import type { Asset, Tag } from '@/data/boardData';

export const IPO_LIST: { name: string; tag: Tag; icon?: string }[] = [
    { name: 'AI Safety Auditor', tag: 'AI' },
    { name: 'Chip Packaging Plant', tag: 'CHIPS' },
    { name: 'Battery & Storage', tag: 'ENERGY' },
    { name: 'Stablecoin Bank', tag: 'CRYPTO', icon: 'Bitcoin' },
    { name: 'Short Video Network', tag: 'MEDIA', icon: 'Film' },
];

export function applyBankruptcyAndIpo(board: Asset[], ipoIndex: number) {
    let nextIndex = ipoIndex;
    const updatedBoard = board.map(asset => {
        if (asset.isPayday) return asset;
        if (asset.dividend > 0) return asset;

        const ipo = IPO_LIST[nextIndex % IPO_LIST.length];
        nextIndex += 1;

        return {
            ...asset,
            name: ipo.name,
            tag: ipo.tag,
            dividend: 200,
            price: 500,
            previousPrice: 500,
            sharesRemaining: asset.sharesTotal,
            shareholders: [],
            isBankrupt: false,
            icon: ipo.icon,
        };
    });

    return { board: updatedBoard, ipoIndex: nextIndex };
}
