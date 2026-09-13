import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/landing/site-chrome";

export const Route = createFileRoute("/terms")({
  component: Terms,
  head: () => ({ meta: [{ title: "Terms · Kosh" }] }),
});

function Terms() {
  return (
    <LegalPage title="Terms">
      <p>Kosh is a reading tool for a snapshot of holdings. Use it on those terms.</p>
      <h2 className="text-fg">Not advice, not a broker</h2>
      <p>
        Nothing on Kosh is investment advice, a recommendation, a solicitation, or a SEBI-registered service. Past
        portfolio paths are not a forecast. Live prices can lag, gap, or be wrong. You are responsible for what you do with a
        chart.
      </p>
      <h2 className="text-fg">What the numbers are</h2>
      <p>
        The default chart uses today’s weights on each stock’s daily adjusted close. Quiet names are held at last close.
        Days where too little of the portfolio has a price are skipped. It is not time-weighted return of your cashflows,
        and it is not a tax lot ledger. Optional average prices improve unrealised P&L on holdings; they do not
        change the chart method.
      </p>
      <h2 className="text-fg">Accounts</h2>
      <p>
        Google, X, and email sign-in are offered so a portfolio can follow you. Keep the password to yourself. We may close
        an account that is being abused. Guest mode is local to one browser.
      </p>
      <h2 className="text-fg">Availability</h2>
      <p>
        The product is provided as-is. Market data, sign-in, or the site itself can go down. We are not liable for
        lost profits, trading losses, or a portfolio you misread.
      </p>
    </LegalPage>
  );
}
