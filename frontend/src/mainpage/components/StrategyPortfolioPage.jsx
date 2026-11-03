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
