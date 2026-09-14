import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { newsAboutCompany, newsMaterial, newsToneLabel } from "./news.ts";

describe("newsAboutCompany", () => {
  it("drops market wraps and stocks-to-watch lists", () => {
    assert.equal(newsAboutCompany("Stocks to watch today: Reliance, TCS, HDFC Bank", "RELIANCE", "Reliance Industries"), false);
    assert.equal(newsAboutCompany("Top gainers: RELIANCE, INFY", "RELIANCE", "Reliance Industries"), false);
    assert.equal(newsAboutCompany("Market wrap: Sensex, Nifty close higher", "TCS", "Tata Consultancy Services"), false);
    assert.equal(newsAboutCompany("Closing bell: Nifty today", "INFY", "Infosys"), false);
  });

  it("keeps headlines actually about the company", () => {
    assert.equal(newsAboutCompany("Reliance Jio ARPU rises in Q1", "RELIANCE", "Reliance Industries"), true);
    assert.equal(newsAboutCompany("HDFC Bank NIM slips in Q1", "HDFCBANK", "HDFC Bank"), true);
    assert.equal(newsAboutCompany("Infosys large-deal TCV beats estimates", "INFY", "Infosys"), true);
    assert.equal(newsAboutCompany("TCS wins a $2 bn deal", "TCS", "Tata Consultancy Services"), true);
  });

  it("does not treat GST input-tax-credit as ITC the company", () => {
    assert.equal(newsAboutCompany("GST input tax credit rules tightened", "ITC", "ITC Limited"), false);
    assert.equal(newsAboutCompany("How companies claim ITC under GST", "ITC", "ITC Limited"), false);
    assert.equal(newsAboutCompany("ITC cigarette volumes rise in Q1", "ITC", "ITC Limited"), true);
    assert.equal(newsAboutCompany("ITC Limited FMCG margin expands", "ITC", "ITC Limited"), true);
  });

  it("does not credit Tata Steel news to TCS via the word Tata", () => {
    assert.equal(newsAboutCompany("Tata Steel Europe EBITDA slides", "TCS", "Tata Consultancy Services"), false);
  });
});

describe("news material and wording", () => {
  it("marks results and regulation as material, not a price call", () => {
    assert.equal(newsMaterial("Reliance Q1 earnings beat estimates"), "high");
    assert.equal(newsMaterial("SEBI opens probe into ABC Ltd"), "high");
    assert.equal(newsMaterial("TCS order win of $2 bn"), "medium");
    assert.equal(newsMaterial("Broker reiterates hold on Infosys"), "low");
  });

  it("labels tone as wording, not a conclusion", () => {
    assert.equal(newsToneLabel("up"), "Positive wording");
    assert.equal(newsToneLabel("down"), "Negative wording");
    assert.equal(newsToneLabel("neutral"), "Plain");
  });
});
