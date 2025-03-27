import { useState, useEffect } from "react";
//simport { useAuth } from "react-oidc-context";
//import useUserSettings from "../../hooks/useUserSettings";
import axios from "axios";
import "./Trading.css";

const TradingBot = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [lastBuyPrice, setLastBuyPrice] = useState<number | null>(null);
  const [trailingStopPrice, setTrailingStopPrice] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([]);
  // const auth = useAuth();
  // const email = auth?.user?.profile.email;
  const startingBalance = 10000;
  const [balance, setBalance] = useState(startingBalance);
  const [btcBalance, setBTCBalance] = useState(0);
  const [settings, setSettings] = useState<any>();
  
  const [minPrice, setMinPrice] = useState(88000);
  const [maxPrice, setMaxPrice] = useState(99000);
  const [profitTargetPercent, setProfitTargetPercent] = useState(1.05);
  const [stopLossPercent, setStopLossPercent] = useState(2.5);
  const [trailingStopPercent, setTrailingStopPercent] = useState(1.5);
  const [totalProfit, setTotalProfit] = useState(0);

  useEffect(() => {
    if (settings) {
      setMaxPrice(settings.maxPrice);
      setMinPrice(settings.minPrice);
      setStopLossPercent(settings.stopLossPercent);
      setTrailingStopPercent(settings.trailingStopPercent);
      setProfitTargetPercent(settings.profitTargetPercent);
    } else {
      setSettings({maxPrice, minPrice, profitTargetPercent, stopLossPercent, trailingStopPercent});
    }
  }, [settings]);

  useEffect(() => {
    if(!price) {
      getPrice();
    }
  }, []);

  const logMessage = (message: string) => {
    setLog((prevLog) => [...prevLog, message]);
    console.log(message);
  };

  const getPrice = async () => {
    console.log('fetching price');
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      );
      const newPrice = parseFloat(response.data.bitcoin.usd);
      setPrice(newPrice);
    } catch (error) {
      logMessage("Error fetching price: " + error);
    }
    setTimeout(() => getPrice(), 20000);
  };

  useEffect(() => {
    const tradeBot = async () => {
      if (!price) return;
      if(lastBuyPrice) {
        setTotalProfit((btcBalance*lastBuyPrice) - startingBalance);
      }
      logMessage(`Current price: $${price}`);
      console.log(!lastBuyPrice, price, minPrice, balance);
      // Buying logic: Buy when price hits minPrice and no BTC is held
      if (!lastBuyPrice && price <= minPrice && balance > 0) {
        logMessage("Buying BTC...");
        const btcToBuy = balance / price;
        setBTCBalance(btcToBuy);
        setBalance(0);
        setLastBuyPrice(price);
        setTrailingStopPrice(price - price * (stopLossPercent / 100));
        logMessage(`Bought ${btcToBuy.toFixed(6)} BTC at $${price}`);
      }

      // Selling logic: Sell at profit or trailing stop-loss
      if (lastBuyPrice) {
        //const targetSellPrice = lastBuyPrice * (1 + profitTargetPercent / 100);
        //small amount for testing
        const targetSellPrice = lastBuyPrice + 10;
        const newStopPrice = price - price * (trailingStopPercent / 100);
        
        if (newStopPrice > (trailingStopPrice || 0)) {
          setTrailingStopPrice(newStopPrice);
          logMessage(`Updated trailing stop-loss to $${newStopPrice}`);
        }

        if (price >= targetSellPrice || price <= (trailingStopPrice || 0)) {
          logMessage("Selling BTC...");
          const sellValue = btcBalance * price;
          setBalance(sellValue);
          setBTCBalance(0);
          setLastBuyPrice(null);
          setTrailingStopPrice(null);
          logMessage(`Sold BTC for $${sellValue.toFixed(2)}`);
        }
      }
    };

    const interval = setInterval(tradeBot, 10000);
    return () => clearInterval(interval);
  }, [price, lastBuyPrice, trailingStopPrice, minPrice, maxPrice, stopLossPercent, trailingStopPercent, profitTargetPercent, balance, btcBalance]);

  return (
    <div className="trading-bot-container">
      <h1>Trading Bot</h1>
      <p>Total Profit: ${totalProfit.toFixed(2)}</p>
      <p>Balance: ${balance.toFixed(2)}</p>
      <p>BTC Holdings: {btcBalance.toFixed(6)} BTC</p>
      <p>Current Price: {price ? `$${price}` : "Fetching..."}</p>
      <p>Last Buy Price: {lastBuyPrice ? `$${lastBuyPrice}` : "N/A"}</p>
      <p>Trailing Stop Price: {trailingStopPrice ? `$${trailingStopPrice}` : "N/A"}</p>
      <h3>Logs:</h3>
      <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid black", padding: "10px" }}>
        {log.map((entry, index) => (
          <p key={index}>{entry}</p>
        ))}
      </div>
    </div>
  );
};

export default TradingBot;
