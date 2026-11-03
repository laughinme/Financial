              </b>
            </span>
            <span>
              Total&nbsp;P/L
              <b className={colored(summary.total_pnl)}>
                {(summary.total_pnl >= 0 ? "+" : "") +
                  fmtMoney(summary.total_pnl)}
              </b>
            </span>
            <span>
              Portfolios<b>{portfolioCnt}</b>
            </span>
          </div>

          <section className="chart">
            <h2 className="chart-title">All Transactions</h2>
            {chartData.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    stroke="#6B7280"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(d) => dayjs(d).format("DD MMM")}
                  />
                  <YAxis
                    stroke="#6B7280"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => fmtMoney(Math.abs(v))}
                  />
                  <Tooltip
                    formatter={(v, name) => [
                      `${v >= 0 ? "" : "-"}${fmtMoney(Math.abs(v))}`,
                      name,
                    ]}
                    labelFormatter={(d) => dayjs(d).format("DD MMM YYYY")}
                  />
                  <Bar
                    dataKey="amount"
                    name="Amount"
                    barSize={10}
                    isAnimationActive={true}
                    animationDuration={800}
                  >
                    {chartData.map((d, i) => (
                      <Cell
                        key={i}
                        fill={d.amount < 0 ? "#EF4444" : "#10B981"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No data</div>
            )}
            <TimeRangeSelector
              ranges={RANGES}
              value={range}
              onChange={setRange}
            />
          </section>

          <section className="tx-block">
            <h2 className="section-title">Your Transactions</h2>
            {tx ? (
              <>
                <ul className="tx-list">
                  {visibleTx.map((t) => (
                    <li key={t.id}>
                      <span>
                        {dayjs(t.created_at || t.date).format("DD MMM")}
                      </span>
                      <span>{t.type}</span>
                      <span className={colored(t.amount)}>
                        {(t.amount >= 0 ? "+" : "") +
                          fmtMoney(Math.abs(t.amount))}
                      </span>
                      <span className="tx-note">
                        {t.comment || t.note}
                      </span>
                    </li>
                  ))}
                </ul>
                {tx.length > 5 && (
                  <button
                    className="show-btn"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? "Hide" : "Show all"}
                  </button>
                )}
              </>
            ) : (
              <div className="no-data">Loading…</div>
            )}
          </section>
        </main>
      </div>

      <MoneyModal
        open={modal.open}
        title={modal.type === "deposit" ? "Deposit USD" : "Withdraw USD"}
        label="Amount (USD)"
        onClose={() => setModal({ open: false, type: null })}
        onSubmit={onSubmit}
      />
    </>
  );
}
