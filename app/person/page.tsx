"use client";

import { useState, useEffect } from 'react';
import styles from './UserProfile.module.css';

export default function UserProfile() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 模拟获取用户数据 - 更真实的数据结构
  useEffect(() => {
    const mockUserData = {
      basicInfo: {
        avatar: '/images/avatar-default.png',
        name: '张小明',
        userId: 'U20240001',
        email: 'zhangxiaoming@example.com',
        phone: '138-1234-5678',
        gender: '男',
        birthday: '1990-05-15'
      },
      accountInfo: {
        level: '黄金会员',
        points: 1250,
        growthValue: 850,
        registrationDate: '2023-06-20',
        lastLogin: '2024-01-15 14:30:25',
        status: '正常'
      },
      securityInfo: {
        emailVerified: true,
        phoneVerified: true,
        realNameVerified: true,
        lastPasswordChange: '2023-11-10'
      }
    };
    
    setTimeout(() => {
      setUserInfo(mockUserData);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className={styles.profileLoading}>
        <div className={styles.loadingSpinner}></div>
        <p>正在加载用户信息...</p>
      </div>
    );
  }

  return (
    <div className={styles.userProfileContainer}>
      {/* 登录成功提示 */}
      <div className={styles.loginSuccessHeader}>
        <div className={styles.successIcon}>✓</div>
        <h1>登录成功！</h1>
        <p className={styles.welcomeMessage}>欢迎回来，{userInfo.basicInfo.name}！</p>
      </div>

      {/* 基本信息卡片 */}
      <div className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>基本信息</h2>
        <div className={styles.infoCard}>
          <div className={styles.avatarSection}>
            <img 
              src={userInfo.basicInfo.avatar} 
              alt="用户头像" 
              className={styles.userAvatar}
            />
            <div className={styles.avatarOverlay}>
              <span>更换头像</span>
            </div>
          </div>
          
          <div className={styles.basicInfoGrid}>
            <div className={styles.infoItem}>
              <label>姓名</label>
              <span>{userInfo.basicInfo.name}</span>
            </div>
            <div className={styles.infoItem}>
              <label>用户ID</label>
              <span>{userInfo.basicInfo.userId}</span>
            </div>
            <div className={styles.infoItem}>
              <label>电子邮箱</label>
              <span>{userInfo.basicInfo.email}</span>
            </div>
            <div className={styles.infoItem}>
              <label>手机号码</label>
              <span>{userInfo.basicInfo.phone}</span>
            </div>
            <div className={styles.infoItem}>
              <label>性别</label>
              <span>{userInfo.basicInfo.gender}</span>
            </div>
            <div className={styles.infoItem}>
              <label>生日</label>
              <span>{userInfo.basicInfo.birthday}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 账户信息卡片 */}
      <div className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>账户信息</h2>
        <div className={styles.infoCard}>
          <div className={styles.accountStats}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{userInfo.accountInfo.level}</div>
              <div className={styles.statLabel}>会员等级</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{userInfo.accountInfo.points}</div>
              <div className={styles.statLabel}>积分</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{userInfo.accountInfo.growthValue}</div>
              <div className={styles.statLabel}>成长值</div>
            </div>
          </div>
          
          <div className={styles.accountDetails}>
            <div className={styles.detailItem}>
              <label>注册时间</label>
              <span>{userInfo.accountInfo.registrationDate}</span>
            </div>
            <div className={styles.detailItem}>
              <label>最后登录</label>
              <span>{userInfo.accountInfo.lastLogin}</span>
            </div>
            <div className={styles.detailItem}>
              <label>账户状态</label>
              <span className={styles.statusActive}>{userInfo.accountInfo.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 安全信息卡片 */}
      <div className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>安全信息</h2>
        <div className={styles.infoCard}>
          <div className={styles.securityItems}>
            <div className={styles.securityItem}>
              <span className={styles.securityLabel}>邮箱验证</span>
              <span className={`${styles.securityStatus} ${userInfo.securityInfo.emailVerified ? styles.verified : styles.unverified}`}>
                {userInfo.securityInfo.emailVerified ? '已验证' : '未验证'}
              </span>
            </div>
            <div className={styles.securityItem}>
              <span className={styles.securityLabel}>手机验证</span>
              <span className={`${styles.securityStatus} ${userInfo.securityInfo.phoneVerified ? styles.verified : styles.unverified}`}>
                {userInfo.securityInfo.phoneVerified ? '已验证' : '未验证'}
              </span>
            </div>
            <div className={styles.securityItem}>
              <span className={styles.securityLabel}>实名认证</span>
              <span className={`${styles.securityStatus} ${userInfo.securityInfo.realNameVerified ? styles.verified : styles.unverified}`}>
                {userInfo.securityInfo.realNameVerified ? '已认证' : '未认证'}
              </span>
            </div>
            <div className={styles.securityItem}>
              <span className={styles.securityLabel}>最后修改密码</span>
              <span className={styles.securityDate}>{userInfo.securityInfo.lastPasswordChange}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className={styles.quickActions}>
        <h3>快捷操作</h3>
        <div className={styles.actionButtons}>
          <button className={`${styles.actionBtn} ${styles.primary}`}>编辑资料</button>
          <button className={`${styles.actionBtn} ${styles.secondary}`}>安全设置</button>
          <button className={`${styles.actionBtn} ${styles.outline}`}>会员中心</button>
          <button className={`${styles.actionBtn} ${styles.outline}`}>我的积分</button>
        </div>
      </div>
    </div>
  );
}