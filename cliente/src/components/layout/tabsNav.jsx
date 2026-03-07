function TabsNav({ tabsVisibles, tab, setTab }) {
  return (
    <>
      <nav className="tabs tabs-wide">
              {tabsVisibles.map((t) => (
                <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
                  {t}
                </button>
              ))}
            </nav>
    </>
  );
}

export default TabsNav;
