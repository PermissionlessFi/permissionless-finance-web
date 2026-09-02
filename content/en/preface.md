# Preface

## Why This Book Exists

I arrived at this subject twice.

The first time was in traditional finance and trading, where I learned that a market is never just a place where prices meet — it is a trust machine two centuries in the making, built on central counterparties, multi-layered clearing, and regulation, and yet it never resolved one fundamental contradiction: institutionalized trust is itself the greatest single point of failure. From the collapse of Lehman Brothers to the implosion of FTX, every crisis asks the same question — can we build a financial system that does not depend on intermediary credit? The second time was in blockchain, where I watched a generation of engineers try to answer it, rebuilding those same functions — custody, matching, clearing, settlement, price discovery — from first principles, in the open, with code standing in for the institutions the rest of finance takes for granted. The perpetual future sat at the center of that effort: the instrument that, more than any other, became the native language of these new markets, and the clearest proof so far that price discovery itself can be permissionless.

We live in an age when information has never been cheaper. Ask a model, search a forum, read a hundred threads, and fragments of the answer will appear in seconds. Yet if you want a single, systematic account of how permissionless perpetual markets actually work — from the anatomy of a single order to the macro question of whether these markets might one day help price the world — you will not find it. The knowledge exists, but it is scattered across exchange documentation, academic papers written in different dialects, audit reports, and the tacit intuition of practitioners who rarely write things down. Abundance of information is not the same as structure. This book is my attempt to supply the structure: to connect the microstructure of a single trade to the architecture of a global, on-chain financial system, and to do it with the seriousness the subject deserves.

## Who This Book Is For

This book is written for the reader who wants to understand *why*, not only *how*:

- **Traders and practitioners** who already use these markets and want a rigorous model of the machinery beneath the interface — funding, liquidation, order books, liquidity, and the reflexive dynamics that turn ordinary days into cascades.
- **Builders and engineers** designing exchanges, protocols, oracles, and risk systems, who need to see how each design choice propagates from the microstructure outward.
- **Researchers and students** of market microstructure, financial economics, and distributed systems, who want a coherent framework and an evidence map rather than a collection of anecdotes.
- **Policymakers and the intellectually curious**, who sense that something structurally new is happening and want an honest account of both its promise and its fragilities.

You do not need to be a quant or a Solidity developer. You do need a willingness to think carefully.

## What You Will Gain

By the end, you should be able to trace a single order from intention to execution; explain how funding rates, liquidation, and margin jointly hold a perpetual market to reality — and how, under stress, they fail; reason about price discovery, information efficiency, arbitrage, liquidity, and volatility as one connected system rather than isolated topics; and evaluate, regulate, and ultimately imagine *building* a better version of these markets. The aim is not to give you predictions to trade on, but a set of durable mental models that outlive any particular protocol or cycle. Along the way you will meet several analytical frameworks of my own — among them a four-source decomposition of volatility and a five-dimensional evaluation of market quality — offered not as final answers but as tools you can pick up, test, and sharpen.

## How This Book Is Organized

The book has thirty-three chapters grouped into ten parts, and those parts build in five layers.

- **The foundation (Part I, Chapters 1–3)** asks what digital assets and perpetual futures actually are, and why they deserve to exist at all.
- **The ecosystem (Parts II–III, Chapters 4–9)** turns to who trades these instruments, the infrastructure they depend on, and how a single trade becomes a price — culminating in Hyperliquid as a worked case study of an on-chain order book.
- **The theoretical core (Parts IV–VIII, Chapters 10–24)** is the heart of the book: pricing mechanisms (funding, liquidation, margin), information and efficiency, arbitrage and anomalies, liquidity, and volatility — the deep operating logic of the market.
- **The engineering (Part IX, Chapters 25–30)** follows a "diagnose first, then prescribe" arc: measuring market quality and the economics of regulation, then designing trust, decentralized clearing, and automated governance — closing with a thought experiment on what happens if perpetual futures come to price the world.
- **The future (Part X, Chapters 31–33)** looks at AI as market infrastructure, the possibility of autonomous on-chain finance, and where all of this may be heading — ending not with a conclusion but with the next question.

Each part can be read on its own, but the arguments compound: the stop-loss order in Chapter 7 becomes the liquidation cascade of Chapter 11 and the volatility of Chapter 22; the three futures sketched in Chapter 3 are the ones judged in Chapter 33. Read straight through and you will feel the loops close.

## The Landscape in 2026

As I write, perpetual futures have become the dominant instrument by volume in digital-asset markets — and the model is spilling beyond crypto, with perpetuals now written on equities, commodities, foreign exchange, and more. Meanwhile, the line between centralized and decentralized venues is visibly dissolving. On-chain order books that seemed like research toys a few years ago now clear meaningful flow; oracles, clearing, and margin logic increasingly live in public code; and regulators across major jurisdictions are moving from denial to design. It is a moment of unusual plasticity — the rules of this market are still being written, which is precisely why understanding its microstructure matters now rather than later. The choices made in the next few years about liquidation engines, oracle governance, and incentive design will harden into the plumbing of a global system. And a deeper shift is already visible at the edges: algorithms are moving from being tools of the market to being its infrastructure — quoting, hedging, clearing, and increasingly enforcing the rules themselves. Code defines those rules, algorithms execute them, and consensus verifies them; the outline of an autonomous financial system is emerging from theory into practice.

## Why I Believe in This Future

I will be honest about my bias: I believe in the permissionless future. Not as an ideology and not as a promise that everything will go well — this book spends many of its chapters on exactly how these markets break — but as a direction: a long migration from permission to permissionlessness, from institutional trust to algorithmic trust, traced through the microstructure where that migration is actually decided. A world in which the core functions of finance are open, programmable, globally reachable, and auditable by anyone is, to me, a better world than the one we inherited, and I have chosen to spend my working life helping build it. This book is the most useful thing I know how to contribute to that project: an attempt to understand the thing clearly, so that we can build it well.
