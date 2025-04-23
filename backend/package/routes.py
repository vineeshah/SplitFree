import os
import secrets
from PIL import Image
from package import app, db, bcrypt
from flask import request, redirect, abort, url_for, jsonify, session
from package.models import User, Expense, Inbox
from flask_login import login_user, logout_user, current_user, login_required


@app.route('/')
@app.route('/home')
def home():
    expenses = Expense.query.all()
    expenses_data = []
    for expense in expenses:
        users = [{"email": user.email, "name": user.name} for user in expense.users]
        expenses_data.append({
            'id': expense.id,
            'title': expense.expense_name,
            'amount': expense.amount,
            'created_at': expense.date_posted.strftime('%Y-%m-%d %H:%M:%S'),
            'ower': expense.ower.name,
            'users': users
        })
    return jsonify(expenses_data)

@app.route('/getmoneyowed')
def owed():
    expenses_you_owe = Expense.query.filter(Expense.users.any(id=current_user.id), Expense.ower_id != current_user.id).all()
    total_money_you_owe = 0
    for expense in expenses_you_owe:
        num_people = len(expense.users)  
        if num_people > 0:
            total_money_you_owe += expense.amount / num_people  
        else:
            total_money_you_owe = 0 

    expenses_owed_to_you = Expense.query.filter_by(ower_id=current_user.id).all()
    total_money_owed_to_you = 0
    for expense in expenses_owed_to_you:
        num_people = len(expense.users)  
        if num_people > 0:
            if current_user.id in [user.id for user in expense.users]:
                total_money_owed_to_you += expense.amount - (expense.amount/num_people)
            else:
                total_money_owed_to_you += expense.amount
        else:
            total_money_owed_to_you = 0 


    # print("Expenses you owe:", total_money_you_owe)
    # print("Expenses owed to you:", total_money_owed_to_you)
    return jsonify({
        'total_money_you_owe': total_money_you_owe,
        'total_money_owed_to_you': total_money_owed_to_you
    })      


@app.route("/register", methods=['POST'])
def register():
    data = request.get_json()
    print(f"Received data: {data}")
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    check_user = User.query.filter_by(name = username).first()
    if check_user:
        abort(400, description= "Username already taken")
    check_email = User.query.filter_by(email = email).first()
    if check_email:
        abort(400, description= "email already taken")

    if not username or not email or not password:
        return jsonify({"error": "Missing fields"}), 400  # Return error

    if current_user.is_authenticated:
        return redirect(url_for('home'))
    hashed_passwd = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(name = username, email = email, password=hashed_passwd)
    try:
        db.session.add(user)
        db.session.commit()
        return jsonify({"success": True, "message": "Registration successful!"}), 201
    except Exception as e:
        print(f"Database error: {e}")  # Print error in Flask terminal
        return jsonify({"success": False, "message": "Registration failed."}), 400
    


@app.route("/login", methods=['POST'])
def login():
    # if request.method=='GET':
    #     if current_user.is_authenticated:
    #         return jsonify({'message': 'Already logged in'}), 200
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email = email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        login_user(user, remember=True)
        session.permanent = True
        session['user_id'] = user.id
        session['_fresh'] = True
        print("Login successful - Session:", session)
        print("User ID in session:", session.get('user_id'))
        return jsonify({'success': True}), 200
    return jsonify({"message": False}), 401

@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("home"))


@app.route('/check_auth')
def check_auth():
    print("Session:", session)
    print("User ID in session:", session.get('user_id'))
    print("Current user:", current_user)
    print("Authenticated:", current_user.is_authenticated)
    if current_user.is_authenticated:
        return jsonify({"is_authenticated": True}), 200
    else:
        return jsonify({"is_authenticated": False}), 401


def save_picture(form_picture):
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(app.root_path, 'static/profile_pics', picture_fn)

    output_size = (125, 125)
    i = Image.open(form_picture)
    i.thumbnail(output_size)
    i.save(picture_path)

    return picture_fn

@app.route("/account", methods = ["POST", "GET"])
def account():
    print("Request method:", request.method)
    if request.method == 'GET' :
        if current_user.is_authenticated:
            image_file = url_for('static', filename='profile_pics/' + current_user.image_file)
            return jsonify({'username': current_user.name, 'email': current_user.email, 'picture': image_file, 'id': current_user.id})
        else:
            image_file = url_for('static', filename='profile_pics/default.jpg')
            return jsonify({'username': 'vineet', 'email': '', 'picture': image_file})

        
    
    elif request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        picture = request.files.get('picture')
        
        
        if(current_user.name!=username):
                check_user = User.query.filter_by(name = username).first()
                if check_user:
                    abort(400, description= "Username already taken")

        if(current_user.email!=email):
                check_email = User.query.filter_by(email = email).first()
                if check_email:
                    abort(400, description= "Email already taken")

        if picture:
            picture_file = save_picture(picture)
            current_user.image_file = picture_file
        current_user.name = username
        current_user.email = email
        db.session.commit()
        # flash('account info updated!!', 'success')
        return redirect(url_for('account'))
    
    # return jsonify({'username': current_user.username, 'email': current_user.email, 'image_file': image_file})

@app.route('/show_users')
def show_users():
    users = User.query.all()
    users_list = [{"id": user.id, "name": user.name} for user in users] 
    return jsonify(users_list)

@app.route('/expense', methods = ["POST"])
def add_expense():
    data = request.get_json()
    expense_name = data.get('expense')
    amount = data.get('amount')
    ower_id = data.get('ower_id')
    selected_users = data.get('selected_users')
    # filtered_users = [user_id for user_id in selected_users if user_id != current_user.id]

    if not selected_users:
        return jsonify({"error": "No users selected"}), 400
    
    expense = Expense(expense_name = expense_name, amount = amount, ower_id = ower_id)
    
    users = User.query.filter(User.id.in_(selected_users)).all()

    expense.users.extend(users)#users because backref is set to users and is many to many

    db.session.add(expense)
    db.session.commit()
    return jsonify({"success": "Expense added successfully"}), 201


# @app.route("/expense/<int:expense_id>")
# def view_expense(expense_id):
#     expense = Expense.query.get_or_404(expense_id)
#     expense_data = {
#         'id': expense.id,
#         'title': expense.expense_name,
#         'amount': expense.amount,
#         'created_at': expense.date_posted.strftime('%Y-%m-%d %H:%M:%S')
#     }
#     return jsonify(expense_data), 200

@app.route("/expense/<int:expense_id>/update", methods=['POST'])
def update_expense(expense_id):
    expense = Expense.query.get(expense_id)
    # if request.method == 'GET':
    #     users = [{"email": user.email, "name": user.name} for user in expense.users]
    #     expense_data = {
    #     'id': expense.id,
    #     'title': expense.expense_name,
    #     'amount': expense.amount,
    #     'created_at': expense.date_posted.strftime('%Y-%m-%d %H:%M:%S'),
    #     'users': users}
    #     return jsonify(expense_data), 200
    
    # else:
    data = request.get_json()
    expense_name = data.get('expense')
    amount = data.get('amount')
    selected_users = data.get('selected_users')
    ower_id = data.get('ower_id')
    expense.expense_name = expense_name
    expense.amount = amount
    expense.ower_id = ower_id
    users = User.query.filter(User.id.in_(selected_users)).all()
    expense.users = users
    db.session.commit()
    return jsonify({"success": "Expense updated successfully"}), 200


    

@app.route("/expense/<int:expense_id>/delete", methods=['DELETE'])
def delete_expense(expense_id):
    expense = Expense.query.get(expense_id)
    db.session.delete(expense)
    db.session.commit()
    return jsonify({"message": "Expense deleted successfully"}), 200 

@app.route("/send_notification", methods=['POST'])
def friend_request():
    data = request.get_json()
    recipient_id = data.get('recipient_id')
    message = data.get('message')

    if not recipient_id or not message:
        return jsonify({"error": "Recipient and message are required"}), 400

    notification = Inbox(user_id=recipient_id, sender_id=current_user.id, message=message)
    db.session.add(notification)
    db.session.commit()

    return jsonify({"success": "Notification sent"}), 201


@app.route('/notifications')
def get_notifications():
    notifications = Inbox.query.filter_by(user_id=current_user.id).all()
    notifications_data = [
        {
            "id": notification.id,
            "message": notification.message,
            "timestamp": notification.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            "is_read": notification.is_read,
            "sender_id":notification.sender_id
        }
        for notification in notifications
    ]
    return jsonify(notifications_data)

@app.route('/notifications/<int:notification_id>/read', methods=['POST'])
def mark_notification_as_read(notification_id):
    notification = Inbox.query.get_or_404(notification_id)
    if notification.user_id != current_user.id:
        abort(403)  # Forbidden: User can only mark their own notifications as read

    notification.is_read = True
    db.session.delete(notification)
    db.session.commit()
    return jsonify({"success": "Notification marked as read"}), 200

@app.route('/add_friend', methods=['POST'])
def add_friend():
    data = request.get_json()
    friend_id = data.get('friend_id')

    if not friend_id:
        return jsonify({"error": "Friend ID is required"}), 400

    friend = User.query.get(friend_id)
    # if not friend:
    #     return jsonify({"error": "User not found"}), 404

    # if friend in current_user.friends:
    #     return jsonify({"error": "User is already your friend"}), 400
    
    current_user.friends.append(friend)
    friend.friends.append(current_user)
    db.session.commit()

    return jsonify({"success": f"{friend.name} has been added as a friend"}), 201

@app.route('/friends', methods=['GET'])
def get_friends():
    friends = current_user.friends.all()  # Use .all() because of lazy='dynamic'
    friends_data = [
        {
            'id': friend.id,
            'name': friend.name,
            'email': friend.email,
            'image_file': friend.image_file 
        }
        for friend in friends
    ]
    
    return jsonify(friends_data), 200