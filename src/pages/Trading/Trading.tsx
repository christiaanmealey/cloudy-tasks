import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import useUserSettings from "../../hooks/useUserSettings";
import axios from "axios";
import "./Trading.css";

const TradingBot = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [lastBuyPrice, setLastBuyPrice] = useState<number | null>(null);
  const [trailingStopPrice, setTrailingStopPrice] = useState<number | null>(
    null
  );
  const [log, setLog] = useState<string[]>([]);
  const auth = useAuth();
  const email = auth?.user?.profile.email;
  const { settings } = useUserSettings(email);

  const [minPrice, setMinPrice] = useState(30000);
  const [maxPrice, setMaxPrice] = useState(35000);
  const [tradeAmount, setTradeAmount] = useState(0.01);
  const [stopLossPercent, setStopLossPercent] = useState(5);
  const [trailingStopPercent, setTrailingStopPercent] = useState(3);

  useEffect(() => {
    if (settings) {
      setMaxPrice(settings.maxPrice);
      setMinPrice(settings.minPrice);
      setTradeAmount(settings.tradeAmunt);
      setStopLossPercent(settings.stopLoss);
      setTrailingStopPercent(settings.trailingStop);
    }
  }, [settings]);
  const logMessage = (message: string) => {
    setLog((prevLog) => [...prevLog, message]);
    console.log(message);
  };

  const getPrice = async () => {
    try {
      const response = await axios.get(
        "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
      );
      setPrice(parseFloat(response.data.price));
    } catch (error) {
      logMessage("Error fetching price: " + error);
    }
  };

  const placeOrder = async (side: string) => {
    try {
      const orderData = {
        symbol: "BTCUSDT",
        side: side,
        type: "MARKET",
        quantity: tradeAmount,
      };

      const response = await axios.post(
        "https://api.binance.com/api/v3/order",
        orderData,
        {
          headers: { "X-MBX-APIKEY": "your_api_key" },
        }
      );

      logMessage(`${side} order placed: ${JSON.stringify(response.data)}`);
      return response.data.fills[0].price;
    } catch (error) {
      logMessage("Error placing order: " + error);
    }
  };

  useEffect(() => {
    const tradeBot = async () => {
      await getPrice();
      if (!price) return;

      logMessage(`Current price: $${price}`);

      if (!lastBuyPrice && price <= minPrice) {
        logMessage("Buying BTC...");
        const buyPrice = await placeOrder("BUY");
        setLastBuyPrice(buyPrice);
        setTrailingStopPrice(buyPrice - buyPrice * (stopLossPercent / 100));
        logMessage(
          `Bought at $${buyPrice}, Stop-Loss set at $${
            buyPrice - buyPrice * (stopLossPercent / 100)
          }`
        );
      }

      if (lastBuyPrice) {
        const newStopPrice = price - price * (trailingStopPercent / 100);

        if (!trailingStopPrice) {
          console.error("Trailing stop price not set");
          return;
        }

        if (newStopPrice > trailingStopPrice) {
          setTrailingStopPrice(newStopPrice);
          logMessage(`Updated trailing stop-loss to $${newStopPrice}`);
        }

        if (price >= maxPrice || price <= trailingStopPrice) {
          logMessage("Selling BTC...");
          await placeOrder("SELL");
          setLastBuyPrice(null);
          setTrailingStopPrice(null);
          logMessage("Trade cycle complete.");
        }
      } else {
        logMessage("No trade executed.");
      }
    };

    const interval = setInterval(tradeBot, 60000);
    return () => clearInterval(interval);
  }, [
    price,
    lastBuyPrice,
    trailingStopPrice,
    minPrice,
    maxPrice,
    tradeAmount,
    stopLossPercent,
    trailingStopPercent,
  ]);

  return (
    <div className="trading-bot-container">
      <h1>Trading Bot</h1>

      <div className="form-group">
        <label>Min Price: </label>
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label>Max Price: </label>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label>Trade Amount (BTC): </label>
        <input
          type="number"
          value={tradeAmount}
          onChange={(e) => setTradeAmount(Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label>Stop Loss %: </label>
        <input
          type="number"
          value={stopLossPercent}
          onChange={(e) => setStopLossPercent(Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label>Trailing Stop %: </label>
        <input
          type="number"
          value={trailingStopPercent}
          onChange={(e) => setTrailingStopPercent(Number(e.target.value))}
        />
      </div>

      <p>Current Price: {price ? `$${price}` : "Fetching..."}</p>
      <p>Last Buy Price: {lastBuyPrice ? `$${lastBuyPrice}` : "N/A"}</p>
      <p>
        Trailing Stop Price:{" "}
        {trailingStopPrice ? `$${trailingStopPrice}` : "N/A"}
      </p>

      <h3>Logs:</h3>
      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid black",
          padding: "10px",
        }}
      >
        {log.map((entry, index) => (
          <p key={index}>{entry}</p>
        ))}
      </div>
    </div>
  );
};

export default TradingBot;
