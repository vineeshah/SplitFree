from package import app, db, migrate
from flask import session

with app.app_context():
    try:
        db.create_all()
    except Exception as e:
        print(f"Database connection failed: {e}")


if __name__ == '__main__':
    app.run(debug = True)