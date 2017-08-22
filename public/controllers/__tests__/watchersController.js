import moment from 'moment';
import sinon from 'auto-release-sinon';
import Promise from 'bluebird';
import ngMock from 'ng_mock';
import expect from 'expect.js';
import _ from 'lodash';

import defaultEmailSource from '../../defaults/email_watcher';

import '../watchersController';

describe('watchersController', function () {
  let $httpBackend;
  let $scope;
  let $route;
  let $location;
  let Watcher;
  let dataTransfer;

  const init = function (done) {
    ngMock.module('kibana');

    ngMock.inject(function ($rootScope, $controller, _$location_, _$httpBackend_, _$route_, _Watcher_, _dataTransfer_) {
      $scope = $rootScope;
      $route = _$route_;
      $location = _$location_;
      $httpBackend = _$httpBackend_;
      Watcher = _Watcher_;
      dataTransfer = _dataTransfer_;

      sinon.stub(Watcher, 'list', () => {
        return Promise.resolve([
          { _id: '123' },
          { _id: '456' }
        ]);
      });

      $route.current = {
        locals: {
          currentTime: moment('2016-08-08T11:56:42.108Z')
        }
      };

      $controller('WatchersController', {
        $scope,
        $route,
        $uibModal: {}
      });

      $scope.$apply();
    });
  };

  const failTest = function (error) {
    expect(error).to.be(undefined);
  };

  beforeEach(function () {
    init();
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('title and description', function () {
    expect($scope.title).to.equal('Sentinl: Watchers');
    expect($scope.description).to.be('Kibi/Kibana Report App for Elasticsearch');
  });

  it('watchers have been loaded', function (done) {
    setTimeout(function () { // catch promise response
      expect($scope.watchers.length).to.equal(2);
      done();
    });
  });

  it('create new watcher', function (done) {
    const watcher = {
      _id: '123',
      _type: 'sentinl-watcher',
      _source: _.cloneDeep(defaultEmailSource)
    };

    sinon.stub(Watcher, 'new', () => {
      return Promise.resolve(watcher);
    });

    $scope.newWatcher();

    setTimeout(function () {
      expect($location.path()).to.equal('/editor');

      const watcherFromStorage = dataTransfer.getWatcher();
      expect(watcherFromStorage._id).to.equal(watcher._id);
      expect(_.isEqual(_.keys(watcherFromStorage._source).sort(), _.keys(watcher._source).sort())).to.be(true);

      done();
    });
  });

});
