import { Fragment, useMemo, useState } from 'react'
import pokedex from '../pokedex.json'

const COLUMNS = [
  { key: 'id', label: '#', numeric: true },
  { key: 'name', label: 'Name', numeric: false },
  { key: 'primary_type', label: 'Type 1', numeric: false },
  { key: 'secondary_type', label: 'Type 2', numeric: false },
  { key: 'hp', label: 'HP', numeric: true },
  { key: 'attack', label: 'Atk', numeric: true },
  { key: 'defense', label: 'Def', numeric: true },
  { key: 'special_attack', label: 'Sp.Atk', numeric: true },
  { key: 'special_defense', label: 'Sp.Def', numeric: true },
  { key: 'speed', label: 'Speed', numeric: true },
  { key: 'total', label: 'Total', numeric: true },
]

const TYPE_COLORS = {
  NORMAL: '#9fa19f', FIRE: '#e62829', WATER: '#2980ef', ELECTRIC: '#fac000',
  GRASS: '#3fa129', ICE: '#3dcef3', FIGHTING: '#ff8000', POISON: '#9141cb',
  GROUND: '#915121', FLYING: '#81b9ef', PSYCHIC: '#ef4179', BUG: '#91a119',
  ROCK: '#afa981', GHOST: '#704170', DRAGON: '#5060e1', DARK: '#50413f',
  STEEL: '#60a1b8', FAIRY: '#ef70ef',
}

function typeStyle(t) {
  const c = TYPE_COLORS[t] || '#68a090'
  return { background: c, color: '#fff', textShadow: '0 1px 1px rgba(0,0,0,.35)' }
}

export default function App() {
  const allTypes = useMemo(() => {
    const s = new Set()
    pokedex.forEach(p => { if (p.primary_type) s.add(p.primary_type); if (p.secondary_type) s.add(p.secondary_type) })
    return [...s].sort()
  }, [])

  // sort === null means default order (by dex #, ascending)
  const [sort, setSort] = useState(null)
  const [search, setSearch] = useState('')
  const [primaryType, setPrimaryType] = useState('')
  const [secondaryType, setSecondaryType] = useState('')
  const [anyType, setAnyType] = useState('')

  function toggleSort(key) {
    setSort(prev => {
      const col = COLUMNS.find(c => c.key === key)
      const firstDir = col.numeric ? 'desc' : 'asc'
      const secondDir = firstDir === 'asc' ? 'desc' : 'asc'
      if (!prev || prev.key !== key) return { key, dir: firstDir }   // 1st click
      if (prev.dir === firstDir) return { key, dir: secondDir }      // 2nd click
      return null                                                    // 3rd click -> default
    })
  }

  const rows = useMemo(() => {
    let data = pokedex

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      data = data.filter(p => p.name.toLowerCase().includes(q) || String(p.id) === q)
    }

    if (primaryType) data = data.filter(p => p.primary_type === primaryType)
    if (secondaryType) data = data.filter(p => p.secondary_type === secondaryType)
    if (anyType) data = data.filter(p => p.primary_type === anyType || p.secondary_type === anyType)

    const { key, dir } = sort ?? { key: 'id', dir: 'asc' }
    const col = COLUMNS.find(c => c.key === key)
    const mult = dir === 'asc' ? 1 : -1
    return [...data].sort((a, b) => {
      const av = a[key], bv = b[key]
      if (col?.numeric) return (av - bv) * mult
      return String(av).localeCompare(String(bv)) * mult
    })
  }, [search, primaryType, secondaryType, anyType, sort])

  return (
    <div className="wrap">
      <header>
        <h1>Infinite Fusion Pokédex</h1>
        <p className="sub">{rows.length} of {pokedex.length} Pokémon · click a column header to sort</p>
      </header>

      <div className="controls">
        <input
          className="search"
          type="text"
          placeholder="Search by name or #…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filters">
          <label className="filter">
            <span>Primary type</span>
            <select value={primaryType} onChange={e => setPrimaryType(e.target.value)}>
              <option value="">All</option>
              {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="filter">
            <span>Secondary type</span>
            <select value={secondaryType} onChange={e => setSecondaryType(e.target.value)}>
              <option value="">All</option>
              {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="filter">
            <span>Any type</span>
            <select value={anyType} onChange={e => setAnyType(e.target.value)}>
              <option value="">All</option>
              {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          {(primaryType || secondaryType || anyType) && (
            <button className="clear-btn" onClick={() => { setPrimaryType(''); setSecondaryType(''); setAnyType('') }}>
              clear
            </button>
          )}
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {COLUMNS.map(c => (
                <Fragment key={c.key}>
                  <th
                    onClick={() => toggleSort(c.key)}
                    className={(c.numeric ? 'num ' : '') + (sort?.key === c.key ? 'sorted' : '')}
                  >
                    {c.label}
                    <span className="arrow">{sort?.key === c.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}</span>
                  </th>
                  {c.key === 'id' && <th className="sprite-col" aria-label="Sprite"></th>}
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(p => (
              <tr
                key={p.id}
                className="row-link"
                onClick={() => window.open(`https://infinitefusiondex.com/${p.id}`, '_blank', 'noopener')}
                title={`Open ${p.name} on InfiniteFusionDex`}
              >
                <td className="num dim">{p.id}</td>
                <td className="sprite-col">
                  {p.image && <img className="sprite" src={p.image} alt={p.name} loading="lazy" />}
                </td>
                <td className="name">{p.name}</td>
                <td><span className="badge" style={typeStyle(p.primary_type)}>{p.primary_type}</span></td>
                <td>
                  {p.secondary_type
                    ? <span className="badge" style={typeStyle(p.secondary_type)}>{p.secondary_type}</span>
                    : <span className="dim">—</span>}
                </td>
                <td className="num">{p.hp}</td>
                <td className="num">{p.attack}</td>
                <td className="num">{p.defense}</td>
                <td className="num">{p.special_attack}</td>
                <td className="num">{p.special_defense}</td>
                <td className="num">{p.speed}</td>
                <td className="num total">{p.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="empty">No Pokémon match those filters.</p>}
      </div>
    </div>
  )
}
