# PyLaunch

**PyLaunch** — десктопный менеджер Python-программ для нетехнических пользователей.

## Возможности

- 🗂 **Каталог программ** — карточки с описанием и кнопкой «Запустить»
- ⬇ **Умная установка** — pip install скрыт за кнопкой «Подготовить программу»
- 🔍 **Человекочитаемые ошибки** — traceback → понятное сообщение
- 🎨 **6 тем** — Ночь, Аврора, Закат, Иней, Лес, Роза
- 🧙 **Мастер первого запуска** — пошаговая настройка
- 📦 **Импорт** — ZIP-архив, папка, одиночный .py файл
- 🐍 **Управление Python** — выбор версии интерпретатора

## Установка

```bash
pip install pywebview
python main.py
```

## Требования

- Python 3.8+
- pywebview 4.4+
- Windows / macOS / Linux

## Структура

```
pylaunch/
├── main.py              # Точка входа
├── requirements.txt
├── backend/
│   └── api.py           # Python API (логика)
└── frontend/
    ├── index.html        # UI-оболочка
    ├── css/
    │   ├── themes.css    # 6 тем оформления
    │   └── main.css      # Все стили
    └── js/
        ├── api.js        # Мост Python ↔ JS
        ├── app.js        # Инициализация
        ├── catalog.js    # Каталог программ
        ├── importer.js   # Импорт проектов
        ├── modals.js     # Модальные окна + Toast
        ├── python-mgr.js # Управление Python
        ├── settings-page.js
        ├── themes.js     # Смена тем
        └── wizard.js     # Мастер первого запуска
```
