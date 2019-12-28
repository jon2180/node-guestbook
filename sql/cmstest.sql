/*
Navicat MySQL Data Transfer

Source Server         : mysql
Source Server Version : 50617
Source Host           : localhost:3306
Source Database       : cmstest

Target Server Type    : MYSQL
Target Server Version : 50617
File Encoding         : 65001

Date: 2019-12-19 17:38:37
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `post`
-- ----------------------------
DROP TABLE IF EXISTS `post`;
CREATE TABLE `post` (
  `id` char(36) NOT NULL DEFAULT '',
  `title` varchar(255) NOT NULL COMMENT '文章标题',
  `summary` text COMMENT '文章摘要',
  `content` text NOT NULL COMMENT '文章内容',
  `createtime` varchar(13) DEFAULT '' COMMENT '文章创建时间',
  `updatetime` int(13) DEFAULT NULL COMMENT '文章更新时间-时间戳',
  `status` tinyint(2) DEFAULT '0' COMMENT '文章状态（0表示正常 | 1表示删除）',
  `cover` varchar(255) DEFAULT NULL COMMENT '文章封面的图片的本地路径',
  `tags` varchar(255) DEFAULT NULL COMMENT '文章标签',
  `userid` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of post
-- ----------------------------
INSERT INTO `post` VALUES ('0046d0f0-223a-11ea-8b76-05ddab4d6459', '震惊', '111', '111', '1576744309631', null, '1', null, null, 'dfa675d0-2239-11ea-8b76-05ddab4d6459');
INSERT INTO `post` VALUES ('47d96ae0-223a-11ea-8b76-05ddab4d6459', '震惊', '111', '111', '1576744429710', null, '1', null, null, 'dfa675d0-2239-11ea-8b76-05ddab4d6459');
INSERT INTO `post` VALUES ('60aebd50-206d-11ea-a3c0-93e0bcb2ea3f', '震惊', '1111', '111', '1576546473381', null, '0', null, null, 'ff44e840-0132-11ea-835a-112d3f563c0a');
INSERT INTO `post` VALUES ('6b57a670-206a-11ea-a549-ed39b5c73cc3', '11', 'rdtfyguhi', 'fghjnk', '1576545202775', null, '0', null, null, 'ff44e840-0132-11ea-835a-112d3f563c0a');
INSERT INTO `post` VALUES ('6f3d7e50-223a-11ea-bb08-67fb04fca90c', '震惊', '1', '1', '1576744495797', null, '1', null, null, 'dfa675d0-2239-11ea-8b76-05ddab4d6459');
INSERT INTO `post` VALUES ('79b150a0-2069-11ea-9053-6109b561a5cc', '震惊', '456789', 'yyy', '1576544797354', null, '0', null, null, 'f418fe40-2007-11ea-b933-594ac126ffbb');
INSERT INTO `post` VALUES ('7dc63250-223a-11ea-bb08-67fb04fca90c', '123', '111', '111', '1576744520181', null, '0', null, null, 'dfa675d0-2239-11ea-8b76-05ddab4d6459');
INSERT INTO `post` VALUES ('fcd24df0-2068-11ea-90b2-b5461c1a4b74', '震惊', '4567890-', '567890-', '1576544587856', null, '0', null, null, 'ff44e840-0132-11ea-835a-112d3f563c0a');

-- ----------------------------
-- Table structure for `user`
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` varchar(200) NOT NULL DEFAULT '' COMMENT '唯一标识符',
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `sex` tinyint(1) NOT NULL,
  `status` varchar(3) NOT NULL DEFAULT '1' COMMENT '用户状态（0：禁用，1：正常，100：删除）'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('0c158910-0090-11ea-abfd-2948cd14c6e0', 'ed_stan', 'U2FsdGVkX1/RXItslQMojzxzEelnMmKu282Xq1Z+Oog=', '123@idjweiudh', '1', '1');
INSERT INTO `user` VALUES ('1c9c4b30-0139-11ea-b8d2-d789b03a4e56', 'absd', 'U2FsdGVkX19BZTejqbKuZVhCvQZiaXAbZYwNLmblqPE=', 'gyvxw@jhxbj', '1', '1');
INSERT INTO `user` VALUES ('2756eaa0-0051-11ea-9da7-1f57da4e73ee', 'stan', 'U2FsdGVkX1+azEq6aR14gmbaLCs4d3uCRYZyIvRQNNs=', '1111@qqq.com', '1', '1');
INSERT INTO `user` VALUES ('ff44e840-0132-11ea-835a-112d3f563c0a', 'aaa', 'U2FsdGVkX19h2SxarMKvO9T0tQR44tENLDr7mGmqxes=', 'gcft@ftvft', '1', '1');
INSERT INTO `user` VALUES ('f418fe40-2007-11ea-b933-594ac126ffbb', 'yyy', 'U2FsdGVkX18sX9c0yMSxmYe1m/2kwY/LxGiYNrT7YHs=', '234@efw.com', '1', '1');
INSERT INTO `user` VALUES ('dfa675d0-2239-11ea-8b76-05ddab4d6459', 'qqq', 'U2FsdGVkX1+dMUqYWcSBsYQjtMJ6NdhaF+l3y0VpQ6k=', '12344@qq.com', '1', '1');
