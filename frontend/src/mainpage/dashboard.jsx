              className="btn primary"
              style={{ marginLeft: 6 }}
              onClick={() => setDepModal(true)}
            >
              Deposit
            </button>

            <span>
              P/L&nbsp;Today:&nbsp;
              <b className={colored(todayPnl)}>
                {todayPnl >= 0 ? "+" : ""}
                {fmtMoney(todayPnl)}
              </b>
            </span>

            <button className="btn danger" onClick={handleLogout}>
              Logout
            </button>
          </div>

          <section className="kpi-grid">
            <div className="kpi-card">
              <p>Total P/L</p>
              <h3 className={colored(totalPnl)}>
                {totalPnl >= 0 ? "+" : ""}
                {fmtMoney(totalPnl)}
              </h3>
            </div>
            <div className="kpi-card">
              <p>Today P/L</p>
              <h3 className={colored(todayPnl)}>
                {todayPnl >= 0 ? "+" : ""}
                {fmtMoney(todayPnl)}
              </h3>
            </div>
            <div className="kpi-card">
              <p>Balance</p>
              <h3>{payBal ? fmtMoney(+payBal.balance) : "…"}</h3>
            </div>
            <div className="kpi-card">
              <p># Portfolios</p>
              <h3>{summary.num_portfolios ?? invested.length}</h3>
            </div>
          </section>

          <section className="charts-row">
            <div className="chart">
              <h2 className="chart-title">Daily P/L</h2>
              {pnlData.length ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={pnlData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="date"
                      stroke="#6B7280"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(d) => dayjs(d).format("DD MMM")}
                    />
                    <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => fmtMoney(v)} />
                    <Bar
                      dataKey="pl"
                      barSize={10}
                      isAnimationActive={true}
                      animationDuration={800}
                    >
                      {pnlData.map((d, i) => (
                        <Cell
                          key={i}
                          fill={d.pl < 0 ? "#EF4444" : "#10B981"}
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
                value={rangePnl}
                onChange={setRangePnl}
              />
            </div>

            <div className="chart">
              <h2 className="chart-title">Allocation</h2>
              {alloc.length ? (
                (() => {
                  const palette = [
                    "#10B981",
                    "#6366F1",
                    "#F59E0B",
                    "#EF4444",
                    "#3B82F6",
                  ];
                  const data = alloc.map((a, i) => ({
                    id: a.id,
                    name: a.name,
                    percentage: +a.percentage,
                    fill: palette[i % palette.length],
                  }));
                  return (
                    <>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Tooltip
                            formatter={(v, n) => [
                              `${(+v).toFixed(2)} %`,
                              n,
                            ]}
                          />
                          <Pie
                            data={data}
                            dataKey="percentage"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={100}
                            labelLine={false}
                          >
                            {data.map((d) => (
                              <Cell key={d.id} fill={d.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>

                      <ul className="alloc-legend">
                        {data.map((d) => (
                          <li key={d.id}>
                            <span
                              className="dot"
                              style={{ background: d.fill }}
                            />
                            {d.name}
                            <span className="pct">
                              {d.percentage.toFixed(2)} %
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  );
                })()
              ) : (
                <div className="no-data">No data</div>
              )}
            </div>
          </section>

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
