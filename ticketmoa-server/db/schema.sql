CREATE TABLE IF NOT EXISTS performances (
  mt20id        VARCHAR(20) PRIMARY KEY,
  prfnm         TEXT NOT NULL,
  prfpdfrom     DATE,
  prfpdto       DATE,
  fcltynm       TEXT,
  mt10id        VARCHAR(20),
  poster        TEXT,
  genrenm       VARCHAR(50),
  prfstate      VARCHAR(20),
  openrun       VARCHAR(1),
  area          TEXT,
  prfcast       TEXT,
  prfcrew       TEXT,
  prfruntime    VARCHAR(50),
  prfage        VARCHAR(50),
  pcseguidance  TEXT,
  sty           TEXT,
  dtguidance    TEXT,
  styurls       TEXT[],
  entrpsnm_p    TEXT,
  entrpsnm_a    TEXT,
  entrpsnm_h    TEXT,
  entrpsnm_s    TEXT,
  visit         VARCHAR(1),
  child         VARCHAR(1),
  daehakro      VARCHAR(1),
  festival      VARCHAR(1),
  updatedate    TIMESTAMP,
  category      VARCHAR(20),
  status        VARCHAR(20),
  synced_at     TIMESTAMP DEFAULT NOW(),
  has_detail    BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_perf_category ON performances(category);
CREATE INDEX IF NOT EXISTS idx_perf_status ON performances(status);
CREATE INDEX IF NOT EXISTS idx_perf_prfstate ON performances(prfstate);
CREATE INDEX IF NOT EXISTS idx_perf_prfpdfrom ON performances(prfpdfrom);
CREATE INDEX IF NOT EXISTS idx_perf_prfnm ON performances USING gin(to_tsvector('simple', prfnm));
