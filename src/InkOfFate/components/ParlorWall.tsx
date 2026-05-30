import { t } from '../i18n';
import type { WallEntry } from '../types';

interface Props {
  entries: WallEntry[];
  loaded: boolean;
  onBack: () => void;
  onView: (entry: WallEntry) => void;
  onNew: () => void;
}

export default function ParlorWall({ entries, loaded, onBack, onView, onNew }: Props) {
  return (
    <div className="iof-wall">
      <header className="iof-wall__head">
        <button type="button" className="iof-wall__back" onPointerDown={onBack}>
          ← {t('wall_back')}
        </button>
        <div className="iof-wall__title-block">
          <div className="iof-wall__title">{t('wall_title')}</div>
          <div className="iof-wall__sub">{t('wall_sub')}</div>
        </div>
        <button type="button" className="iof-wall__new" onPointerDown={onNew}>
          + {t('wall_new')}
        </button>
      </header>

      {!loaded && <div className="iof-wall__loading">{t('wall_loading')}</div>}
      {loaded && entries.length === 0 && (
        <div className="iof-wall__empty">{t('wall_empty')}</div>
      )}

      <div className="iof-wall__grid">
        {entries.map((e) => (
          <button
            key={`${e.userId}-${e.tattoo.id}`}
            className="iof-wall__card"
            type="button"
            onPointerDown={() => onView(e)}
          >
            <div className="iof-wall__card-photo">
              <img src={e.tattoo.imageUrl} alt={e.tattoo.reading.tattoo_description} />
            </div>
            <div className="iof-wall__card-body">
              <div className="iof-wall__card-headline">{e.tattoo.reading.headline}</div>
              <div className="iof-wall__card-meta">
                {e.userName ? <span className="iof-wall__card-name">{e.userName}</span> : null}
                <span className="iof-wall__card-ticket">{e.tattoo.ticketNumber}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
