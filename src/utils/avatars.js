// 默认头像列表（使用在线CDN的头像）
export const defaultAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bailey&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Dusty&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo&backgroundColor=c1f4c5'
]

// 获取随机头像
export const getRandomAvatar = () => {
  const index = Math.floor(Math.random() * defaultAvatars.length)
  return defaultAvatars[index]
}

// 根据用户ID获取固定头像（保证同一用户每次获取到的都是同一个头像）
export const getAvatarByUserId = (userId) => {
  const index = userId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % defaultAvatars.length
  return defaultAvatars[index]
} 