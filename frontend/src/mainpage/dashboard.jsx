          <section className="chart-wide">
            <h2 className="chart-title">Portfolio Value vs Time</h2>
            {valData.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={valData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    stroke="#6B7280"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(d) => dayjs(d).format("DD MMM")}
                  />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => fmtMoney(v)} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No data</div>
            )}
            <TimeRangeSelector
              ranges={RANGES}
              value={rangeVal}
              onChange={setRangeVal}
            />
          </section>

          <section className="bottom-col">
            <div className="portfolios-block">
              <h2 className="section-title">Portfolio Holdings</h2>
              <HoldingsCarousel
                data={alloc.map((a) => ({
                  id: a.id,
                  name: a.name,
                  percentage: a.percentage,
                  spark: (strategies.find((s) => s.id === a.id) || {})
                    .sparkline_gain,
                }))}
                onShow={(title, data) => setSpark({ open: true, title, data })}
              />
            </div>

            <div className="tx-block">
              <h2 className="section-title">Latest Transactions</h2>
              {visibleTx.length ? (
                <>
                  <ul className="tx-list">
                    {visibleTx.map((t) => (
                      <li key={t.id}>
                        <span>{dayjs(t.date).format("DD MMM")}</span>
                        <span>{t.type}</span>
                        <span className={colored(t.amount)}>
                          {(t.amount >= 0 ? "+" : "") +
                            fmtMoney(Math.abs(t.amount))}
                        </span>
                        <span className="tx-note">{t.note}</span>
                      </li>
                    ))}
                  </ul>
                  {tx.length > 10 && (
                    <button
                      className="show-btn"
                      onClick={() => setShow(!showAll)}
                    >
                      {showAll ? "Hide" : "More"}
                    </button>
                  )}
                </>
              ) : (
                <div className="no-data">Loading…</div>
              )}
            </div>
          </section>

          {sparkModal.open && (
            <div
              className="modal-overlay"
              onClick={() => setSpark({ open: false })}
            >
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{sparkModal.title}</h2>
                  <button
                    className="modal-close"
                    onClick={() => setSpark({ open: false })}
                  >
                    ✕
                  </button>
                </div>
                <div className="modal-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <SparklineChart data={sparkModal.data} full />
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <MoneyModal
        open={depModal}
        title="Deposit USD"
        label="Amount (USD)"
        onClose={() => setDepModal(false)}
        onSubmit={doDeposit}
      />
    </>
  );
}
