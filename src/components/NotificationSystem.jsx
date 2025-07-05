import { useState } from 'react';
import { FiBell, FiCheck, FiTrash2, FiX, FiMapPin, FiUsers, FiCalendar, FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';

export default function NotificationSystem({
  notifications,
  showNotifications,
  onToggleNotifications,
  onMarkAsRead,
  onClearAll
}) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <FiAlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <FiAlertTriangle className="w-5 h-5 text-red-600" />; // 🚨 PENALTY NOTIFICATION
      case 'info': return <FiInfo className="w-5 h-5 text-blue-600" />;
      case 'trip': return <FiMapPin className="w-5 h-5 text-purple-600" />;
      case 'join': return <FiUsers className="w-5 h-5 text-orange-600" />;
      case 'reminder': return <FiCalendar className="w-5 h-5 text-yellow-600" />;
      default: return <FiBell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBg = (type, read) => {
    const baseClasses = read ? 'bg-gray-50' : 'bg-white';
    const borderClasses = read ? 'border-gray-200' : 'border-l-4';

    switch (type) {
      case 'success': return `${baseClasses} ${borderClasses} ${!read ? 'border-l-green-500' : ''}`;
      case 'error': return `${baseClasses} ${borderClasses} ${!read ? 'border-l-red-500' : ''}`;
      case 'warning': return `${baseClasses} ${borderClasses} ${!read ? 'border-l-red-600 bg-red-50' : ''}`; // 🚨 PENALTY STYLING
      case 'info': return `${baseClasses} ${borderClasses} ${!read ? 'border-l-blue-500' : ''}`;
      case 'trip': return `${baseClasses} ${borderClasses} ${!read ? 'border-l-purple-500' : ''}`;
      case 'join': return `${baseClasses} ${borderClasses} ${!read ? 'border-l-orange-500' : ''}`;
      case 'reminder': return `${baseClasses} ${borderClasses} ${!read ? 'border-l-yellow-500' : ''}`;
      default: return `${baseClasses} ${borderClasses} ${!read ? 'border-l-gray-500' : ''}`;
    }
  };

  return (
    <div className="relative w-full md:w-auto">
      {/* Notification Bell - more compact for mobile */}
      <button
        onClick={onToggleNotifications}
        className="relative p-2 rounded-full bg-[#6F93AD] hover:bg-[#5E5854] transition-colors text-white flex items-center justify-center"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#EC8E3D] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown - adjust position for mobile */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-xl border-2 border-[#5E5854] shadow-2xl z-50 max-h-[80vh] sm:max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-[#5E5854] bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a]">
            <div className="flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-bold text-white">Notifications</h3>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-xs sm:text-sm text-white hover:text-[#EC8E3D] font-medium transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onToggleNotifications}
                  className="text-white hover:text-[#EC8E3D] transition-colors"
                  aria-label="Close notifications"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-xs sm:text-sm text-white/70 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 sm:p-6 text-center">
                <div className="text-[#204231]/50 mb-2">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <p className="text-sm sm:text-base text-[#204231]/70 font-medium">No notifications yet</p>
                <p className="text-xs sm:text-sm text-[#204231]/50 mt-1">You'll see trip updates here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 sm:p-4 border-b border-[#5E5854]/30 hover:bg-[#EE9C8F]/20 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-[#EE9C8F]/10' : ''
                  } ${notification.type === 'warning' && notification.penalty ? 'border-l-4 border-l-red-600 bg-red-50/50' : ''}`}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-[#2c5e4a] truncate">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-[#f87c6d] rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-sm text-[#5E5854] mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                      {/* 🚨 PENALTY NOTIFICATION DISPLAY */}
                      {notification.penalty && notification.coinsLost && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-lg">
                          <p className="text-xs text-red-700 font-bold flex items-center">
                             Coins Lost: {Math.abs(notification.coinsLost)}
                            <span className="ml-2 text-red-600"> Penalty Applied</span>
                          </p>
                        </div>
                      )}
                      {notification.tripDestination && (
                        <p className="text-xs text-[#f87c6d] font-medium mt-1">
                          Trip: {notification.tripDestination}
                        </p>
                      )}
                      <p className="text-xs text-[#204231]/60 mt-2">
                        {formatTimeAgo(notification.date)}
                      </p>

                      {/* Action buttons for trip-related notifications */}
                      {(notification.type === 'trip_joined' || notification.type === 'join_request') && notification.trip && (
                        <div className="flex gap-2 mt-3">
                          <button
                            className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white px-3 py-1 rounded-full text-xs font-cinzel shadow transition-all"
                            onClick={e => {
                              e.stopPropagation();
                              if (typeof window !== 'undefined' && window.dispatchEvent) {
                                window.dispatchEvent(new CustomEvent('openTripDetails', { detail: notification.trip }));
                              }
                            }}
                          >
                            View Trip
                          </button>
                          <button
                            className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] hover:from-[#1a3a2a] hover:to-[#2c5e4a] text-white px-3 py-1 rounded-full text-xs font-cinzel shadow transition-all"
                            onClick={e => {
                              e.stopPropagation();
                              if (typeof window !== 'undefined' && window.dispatchEvent) {
                                window.dispatchEvent(new CustomEvent('openGroupChat', { detail: notification.trip }));
                              }
                            }}
                          >
                            Group Chat
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
