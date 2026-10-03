# HALO — Prize cards

An animated site for a pump.fun meme token. People join with an X handle. The public profile supplies the name and photo for a prize card. Sparks accrue from holding, referrals, and invite milestones. A ticket-weighted jackpot pays one holder.

Sparks are points on this site. Buying and selling the token happens on pump.fun. Nothing is pulled from a wallet.

## Run

```bash
npm install
npx next dev -p 43123
```

Dev server: [http://127.0.0.1:43123](http://127.0.0.1:43123)

## Coin link

Copy `env.example` to `.env.local`:

```bash
NEXT_PUBLIC_TOKEN_MINT=your_mint_address
```

Restart the server and the home button goes to `https://pump.fun/coin/<mint>`.

## What it does

- **Join** — an X handle such as `nasa`. No password. Profile data comes from the [fxtwitter](https://github.com/FxEmbed/FxEmbed) public API, with [unavatar](https://unavatar.io) as a fallback. A missing handle does not get a card.
- **Card** — one card per handle. Rarities: Common, Rare, Epic, Legendary, Mythic.
- **Hold** — sparks each minute after the card is cut. The rate depends on rarity (`lib/economy.ts`).
- **Refer** — `/join?ref=handle`. The inviter gets 200 sparks, the new holder gets 80.
- **Invite** — extra bonuses at 3, 10, and 25 people.
- **Jackpot** — at least two holders. 70% of the pool goes to one winner. Tickets = card rarity + referral count. Rounds pause for 30 seconds.

Change the numbers in `lib/economy.ts`.

Holder data is stored locally in `data/store.json`. That file is not committed. A serverless host cannot keep a shared file store, so a public multiplayer deploy needs a database.
