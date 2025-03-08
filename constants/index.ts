export const dummy = {
    "success": true,
    "data": {
        "tokenAddress": "0x375f70cf2ae4c00bf37117d0c85a2c71545e6ee05c4a5c7d282cd66a4504b068::usdt::USDT",
        "timestamp": 1741425404939,
        "fraudLikelihood": 95,
        "cookPotential": 56,
        "safetyScore": 90,
        "reason": "High fraud likelihood due to holder concentration and transaction volume",
        "fraudFactors": [
            {
                "name": "Holder Concentration",
                "value": 30,
                "weight": 0.35,
                "description": "30% of tokens held by top 10 wallets"
            },
            {
                "name": "Transaction Volume",
                "value": 62,
                "weight": 0.25,
                "description": "62/100 based on transaction patterns"
            },
            {
                "name": "Contract Age",
                "value": 345,
                "weight": 0.15,
                "description": "Token contract is 345 days old"
            },
            {
                "name": "Code Quality",
                "value": 58,
                "weight": 0.15,
                "description": "58/100 based on contract security analysis"
            },
            {
                "name": "Liquidity Depth",
                "value": 85.5377,
                "weight": 0.1,
                "description": "$144,623 in liquidity pools"
            }
        ],
        "cookFactors": [
            {
                "name": "Volume Growth",
                "value": 74,
                "weight": 0.3,
                "description": "54% increase in 24h trading volume"
            },
            {
                "name": "Social Sentiment",
                "value": 54,
                "weight": 0.25,
                "description": "54/100 based on social media mentions"
            },
            {
                "name": "Holder Growth",
                "value": 35,
                "weight": 0.2,
                "description": "25% new holders in past 7 days"
            },
            {
                "name": "Developer Activity",
                "value": 64,
                "weight": 0.15,
                "description": "32 on-chain events in past week"
            },
            {
                "name": "Market Trend",
                "value": 38,
                "weight": 0.1,
                "description": "8% price trend vs SUI"
            }
        ],
        "safetyChecks": {
            "mintable": {
                "status": "SAFE",
                "details": {
                    "isMintable": false,
                    "description": "Fixed supply, cannot be increased",
                    "treasuryCapInfo": {
                        "owner": "0x0",
                        "status": "Burned"
                    }
                }
            },
            "ownershipRenounced": {
                "status": "SAFE",
                "details": {
                    "isRenounced": true,
                    "description": "Ownership has been renounced, contract cannot be modified",
                    "upgradeCapInfo": {
                        "status": "Burned",
                        "burnTx": "0x0000364b..."
                    }
                }
            },
            "contractUpgradeable": {
                "status": "SAFE",
                "details": {
                    "isUpgradeable": false,
                    "description": "Contract is immutable, cannot be upgraded",
                    "metadataInfo": {
                        "isFrozen": true,
                        "lastModified": "2024-03-28"
                    }
                }
            },
            "lpBurnt": {
                "status": "INFO",
                "details": {
                    "isBurnt": false,
                    "description": "Liquidity tokens are still active",
                    "lpInfo": {
                        "status": "Active",
                        "owner": "Community Multisig",
                        "percentage": "51%"
                    }
                }
            },
            "sufficientLiquidity": {
                "status": "SAFE",
                "details": {
                    "isLiquiditySufficient": true,
                    "amount": "$144,623",
                    "description": "Token has sufficient liquidity for trading",
                    "pools": [
                        {
                            "dex": "CetusSwap",
                            "pair": "USDT/SUI",
                            "liquidity": "$86,774"
                        },
                        {
                            "dex": "TurboSwap",
                            "pair": "USDT/USDC",
                            "liquidity": "$57,849"
                        }
                    ]
                }
            }
        },
        "metadata": {
            "name": "USDT",
            "symbol": "USDT",
            "decimals": 9,
            "totalSupply": 1310411,
            "holderCount": 29007
        },
        "riskIndicators": {
            "rugPullRisk": "High",
            "pumpPotential": "Medium",
            "overallRating": 31,
            "flags": []
        },
        "historicalData": {
            "fraud": [
                {
                    "day": 1,
                    "value": 91
                },
                {
                    "day": 2,
                    "value": 87
                },
                {
                    "day": 3,
                    "value": 83
                },
                {
                    "day": 4,
                    "value": 100
                },
                {
                    "day": 5,
                    "value": 96
                },
                {
                    "day": 6,
                    "value": 92
                },
                {
                    "day": 7,
                    "value": 88
                },
                {
                    "day": 8,
                    "value": 84
                },
                {
                    "day": 9,
                    "value": 80
                },
                {
                    "day": 10,
                    "value": 97
                },
                {
                    "day": 11,
                    "value": 93
                },
                {
                    "day": 12,
                    "value": 89
                },
                {
                    "day": 13,
                    "value": 85
                },
                {
                    "day": 14,
                    "value": 81
                }
            ],
            "cook": [
                {
                    "day": 1,
                    "value": 36
                },
                {
                    "day": 2,
                    "value": 56
                },
                {
                    "day": 3,
                    "value": 76
                },
                {
                    "day": 4,
                    "value": 55
                },
                {
                    "day": 5,
                    "value": 75
                },
                {
                    "day": 6,
                    "value": 54
                },
                {
                    "day": 7,
                    "value": 74
                },
                {
                    "day": 8,
                    "value": 53
                },
                {
                    "day": 9,
                    "value": 73
                },
                {
                    "day": 10,
                    "value": 52
                },
                {
                    "day": 11,
                    "value": 72
                },
                {
                    "day": 12,
                    "value": 51
                },
                {
                    "day": 13,
                    "value": 71
                },
                {
                    "day": 14,
                    "value": 50
                }
            ]
        }
    }
}