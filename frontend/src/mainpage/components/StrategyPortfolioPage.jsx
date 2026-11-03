            </button>
            <button
              className="action-btn"
              style={{ right: 140 }}
              onClick={() => setMoneyModal({ open: true, type: 'withdraw' })}
              disabled={!investedNow}
            >
              Withdraw
            </button>
          </header>

          <section className="kpi-grid">
            <div className="kpi-card">
              <p className="kpi-label">Equity</p>
              <h3>{fmt(strat.equity, 0)}</h3>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">NAV price</p>
              <h3>{fmt(strat.nav_price, 4)}</h3>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Gain&nbsp;%</p>
              <h3 className={strat.gain_percent >= 0 ? 'pos' : 'neg'}>
                {strat.gain_percent >= 0 ? '+' : ''}
                {fmt(strat.gain_percent, 2)}%
              </h3>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Max DD</p>
              <h3 className="neg">{fmt(strat.drawdown, 1)}%</h3>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Invested</p>
              <h3>
                {investedNow && strat.user_value != null
                  ? fmt(strat.user_value, 0) + ' $'
                  : '—'}
              </h3>
            </div>
          </section>

          <section className="chart-row">
            <div
              className="chart-box clickable"
              onClick={() =>
                openChart(
                  'Balance / Equity',
                  <BalanceEquityChart data={balanceData} full />
                )
              }
            >
              <h3 className="chart-title">Balance / Equity</h3>
              <div className="chart-wrapper" style={{ height: CHART_HEIGHT }}>
                {balanceData.length ? (
                  <BalanceEquityChart data={balanceData} />
                ) : (
                  <NoData />
                )}
              </div>
              <div
                className="range-wrapper"
                onClick={(e) => e.stopPropagation()}
              >
                <TimeRangeSelector
                  ranges={RANGES}
                  value={rangeBE}
                  onChange={setRangeBE}
                />
              </div>
            </div>

            <div
              className="chart-box clickable"
              onClick={() =>
                openChart(
                  'Drawdown',
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={drawdownRaw}>
                      <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) => dayjs(d).format('DD MMM')}
                        tick={{ fontSize: 11 }}
                        stroke="#6B7280"
                        tickLine={false}
                        axisLine={{ stroke: '#D1D5DB' }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        width={58}
                        domain={drawdownDomain}
                        tickFormatter={(v) => `${Math.abs(v).toFixed(1)}%`}
                        tick={{ fontSize: 11 }}
                        stroke="#6B7280"
                        tickLine={false}
                        axisLine={{ stroke: '#D1D5DB' }}
                      />
                      <Tooltip
                        formatter={(v) => `${Math.abs(v)}%`}
                        labelFormatter={(d) =>
                          `Date: ${dayjs(d).format('DD MMM')}`
                        }
                      />
                      <Bar
                        dataKey="drawdown"
                        baseValue={0}
                        barSize={4}
                        isAnimationActive={true}
                        animationDuration={800}
                      >
                        {drawdownRaw.map((_, i) => (
                          <Cell key={i} fill="#EF4444" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )
              }
            >
              <h3 className="chart-title">Drawdown</h3>
              <div className="chart-wrapper" style={{ height: CHART_HEIGHT }}>
                {drawdownRaw.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={drawdownRaw}>
                      <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) => dayjs(d).format('DD MMM')}
                        tick={{ fontSize: 11 }}
                        stroke="#6B7280"
                        tickLine={false}
                        axisLine={{ stroke: '#D1D5DB' }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        width={58}
                        domain={drawdownDomain}
                        tickFormatter={(v) => `${Math.abs(v).toFixed(1)}%`}
                        tick={{ fontSize: 11 }}
                        stroke="#6B7280"
                        tickLine={false}
                        axisLine={{ stroke: '#D1D5DB' }}
                      />
                      <Tooltip
                        formatter={(v) => `${Math.abs(v)}%`}
                        labelFormatter={(d) =>
                          `Date: ${dayjs(d).format('DD MMM')}`
                        }
                      />
                      <Bar
                        dataKey="drawdown"
                        baseValue={0}
                        barSize={4}
                        isAnimationActive={true}
                        animationDuration={800}
                      >
                        {drawdownRaw.map((_, i) => (
                          <Cell key={i} fill="#EF4444" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <NoData />
                )}
              </div>
              <div
                className="range-wrapper"
                onClick={(e) => e.stopPropagation()}
              >
                <TimeRangeSelector
                  ranges={RANGES}
                  value={rangeDD}
                  onChange={setRangeDD}
                />
              </div>
            </div>

            <div
              className="chart-box clickable"
              onClick={() =>
                openChart('Daily P/L', <SparklineChart data={plData} full />)
              }
            >
              <h3 className="chart-title">Daily P/L</h3>
              <div className="chart-wrapper" style={{ height: CHART_HEIGHT }}>
                {plData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <SparklineChart data={plData} full />
                  </ResponsiveContainer>
                ) : (
                  <NoData />
                )}
              </div>
              <div
                className="range-wrapper"
                onClick={(e) => e.stopPropagation()}
              >
                <TimeRangeSelector
                  ranges={RANGES}
                  value={rangePL}
                  onChange={setRangePL}
                />
              </div>
            </div>
          </section>

          <section className="description">
            <h3>Strategy description</h3>
            <div
              className="md"
              dangerouslySetInnerHTML={{
                __html: marked.parse(strat.description || ''),
              }}
            />
          </section>
        </main>
      </div>

      <MoneyModal
        open={moneyModal.open}
        title={moneyModal.type === 'withdraw' ? 'Withdraw units' : 'Invest USD'}
        label={moneyModal.type === 'withdraw' ? 'Units' : 'Amount (USD)'}
        mode={moneyModal.type === 'withdraw' ? 'withdraw' : 'invest'}
        navPrice={strat.nav_price}
        onClose={() => setMoneyModal({ open: false, type: null })}
        onSubmit={moneyModal.type === 'withdraw' ? handleWithdraw : handleInvest}
      />

      <ChartModal open={popup.open} title={popup.title} onClose={closeChart}>
        {popup.chart}
      </ChartModal>
    </>
  );
}
