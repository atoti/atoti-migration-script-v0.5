import { test, expect } from "@jest/globals";
import { migrate } from "./migrate";
import fs from "fs";

test("Correctly migrate pricing simulation notebook", () => {
  const path = "test/pricing-simulations.ipynb";

  expect(
    migrate({
      notebooks: [
        {
          content: JSON.parse(fs.readFileSync(path, { encoding: "utf-8" })),
          path,
        },
      ],
      hierarchies: [
        "Products_store:Products",
        "Competitor_prices_store:CompetitorName",
        "Competitor_prices_store:CompetitorPrice",
      ],
    })
  ).toMatchSnapshot();
});
