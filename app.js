$(function () {
  TypingTrainer = function () {
    //Constructor
    this.alphabet =
      'yyyzzz0123456789abcdefghijklmnopqrstuvwxyz';
    this.keys =
      ':;\\\'!@#$%^&*()[]{}`~\/|/|_+=-/?>';
    this.lection = '';
    this.lectionText = '';
    this.score = {
      hits: 0,
      misses: 0,
      lastCheckLength: 0
    };
    this.config = {
      bufferSize: 25,
      bufferReluctanceFactor: 3,
      eventHolder: $('body'),
      lesson: 'random-full'

    };
  };
  //populate lesson buffer
  TypingTrainer.prototype.generateRandomLetter =
    function () {
      var consider = this.keys;
      if (this.config.lesson ==
        'random-full') {
        console.log(
          "alphabet");
        consider += this.alphabet;
      } else if (this.config.lesson ==
        'random-letter') {
        consider = this.alphabet;
      } else if (this.config.lesson ==
        'random-yz') {
        consider = 'zy';
      } else if (this.config.lesson ==
        'random-homerow') {
        consider =
          'asdfghjkl;\':"|\\';
      } else if (this.config.lesson ==
        'random-homerow-bottomrow'
      ) {
        consider =
          '\\||zxcvbnm,./<>?/asdfghjkl;\':"|\\';
      } else if (this.config.lesson ==
        'random-homerow-toprow'
      ) {
        consider =
          'qwertyuiop[]{}asdfghjkl;\':"|\\';
      } else if (this.config.lesson ==
        'random-bottomrow') {
        consider =
          '\\||zxcvbnm,./<>?/';
      } else if (this.config.lesson ==
        'random-toprow') {
        consider =
          'qwertyuiop[]{}';
      } else if (this.config.lesson ==
        'random-numberspechials'
      ) {
        consider =
          '!@#$%^&*()_+=-';
      }


      return consider[Math.ceil(
          Math.random() *
          consider.length
        ) -
        1];
  };

  TypingTrainer.prototype.clearLection =
    function () {
      this.lection = '';
      this.lectionText = '';
      this.config.eventHolder
        .trigger(
          'tt.lection_update'
      );
  };
  TypingTrainer.prototype.clearScore =
    function () {
      this.score.hits = 0;
      this.score.misses = 0;
      this.config.eventHolder
        .trigger(
          'tt.score_update'
      );

  };

  TypingTrainer.prototype.populateLectionBuffer =
    function () {
      if (/random-/g.test(
        this.config.lesson
      )) {
        while (this.lection
          .length < this.config
          .bufferSize) {
          this.lection =
            this.lection +
            this.generateRandomLetter();
          this.config.eventHolder
            .trigger(
              'tt.lection_update'
          );
        }
      } else if (this.config.lesson =
        'wikipedia') {

        if (this.lectionText
          .length < (this
            .config.bufferReluctanceFactor *
            this.config
            .lesson.length
          )) {
          var _self =
            this;
          //TODO: a lot of closed world assumptions here
          $.ajax({
            url: "https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json",
            cache: false,
            dataType: 'jsonp',
            success: function (
              data
            ) {
              var ida =
                data
                .query
                .random[
                  0
              ].id;
              $.ajax({
                url: "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exchars=700&format=json&explaintext&pageids=" + ida,
                cache: false,
                dataType: 'jsonp',
                success: function (
                  data
                ) {

                  //remove all non ascii chars
                  var newLection =
                    data
                    .query
                    .pages[
                      ida
                  ]
                    .extract;
                  newLection =
                    newLection
                    .replace(
                      /[\u0080-\uffff]/g,
                      ""
                  )
                    .replace(
                      /(\r\n|\n|\r)/gm,
                      ""
                  );

                  _self
                    .lectionText +=
                    newLection;
                  console
                    .log(
                      data
                      .query
                      .pages[
                        ida
                      ]
                      .extract
                  );
                  while (
                    _self
                    .lection
                    .length <
                    _self
                    .config
                    .bufferSize
                  ) {

                    //console.log(i,_self.lection);
                    _self
                      .lection =
                      _self
                      .lectionText
                      .slice(
                        0,
                        Math
                        .min(
                          _self
                          .config
                          .bufferSize,
                          _self
                          .lectionText
                          .length
                        )
                    );
                    _self
                      .config
                      .eventHolder
                      .trigger(
                        'tt.lection_update'
                    );
                  }
                }
              });
            }
          });
        }

        while (this.lection
          .length < this.config
          .bufferSize &&
          this.lectionText
          .length > this.config
          .bufferSize) {
          this.lection =
            this.lectionText
            .slice(0,
              Math.min(
                this
                .config
                .bufferSize,
                this
                .lectionText
                .length
              ));
          this.config.eventHolder
            .trigger(
              'tt.lection_update'
          );
        }
      }

  };

  TypingTrainer.prototype.generateLection =
    function () {
      this.clearLection();
      this.populateLectionBuffer();
  };

  TypingTrainer.prototype.reloadLection =
    function (type) {
      this.config.lesson =
        type;
      this.generateLection();
  };

  TypingTrainer.prototype.tryRemove =
    function (input) {

      //only consider first char
      if (input[0] == this.lection[
        0]) {
        this.lection = this
          .lection.slice(
            1, this.lection
            .length);
        this.lectionText =
          this.lectionText
          .slice(1, this.lectionText
            .length);
        this.score.hits++;
        this.config.eventHolder
          .trigger(
            'tt.score_update'
        );
        this.populateLectionBuffer();
        this.score.lastCheckLength =
          input.length;
        return input.slice(
          1, input.length
        );
      }
      console.log(this.score.lastCheckLength,
        input.length)
      if (this.score.lastCheckLength <
        input.length) {
        this.score.misses +=
          input.length -
          this.score.lastCheckLength;
        this.config.eventHolder
          .trigger(
            'tt.score_update'
        );
      }
      this.score.lastCheckLength =
        input.length;
      //falltrough
      return input;
  };



  TypingTrainer.prototype.tryRemoveBuffer =
    function (input) {
      var noTypeError = true;
      if (!input) {
        this.score.lastCheckLength =
          input.length
        return '';
      }
      while (input.length > 0 &&
        noTypeError) {
        var initSize =
          input.length
        input = tt.tryRemove(
          input);
        console.log(input);
        noTypeError = (
          initSize >
          input.length);
      }
      this.score.lastCheckLength =
        input.length
      return input;
  };

  TypingTrainer.prototype.init =
    function () {
      this.generateLection();
  };

  var tt = new TypingTrainer();
  $('#input-lifo')
    .on('keyup',
      function () {

        $(this)
          .val(tt.tryRemoveBuffer(
            $(this)
            .val()))
          .toggleClass(
            'hasMiss', $(
              this)
            .val()
            .length > 0)
          .attr("placeholder",
            '');

      }).focus();

  $('#lesson-select')
    .on('change',
      function () {
        tt.reloadLection($(this)
          .val());
      });
  $('#reload')
    .on('click',
      function () {
        $('#input-lifo')
          .val('')
          .focus();
        tt.clearScore();
        tt.generateLection();
      });

  $('body')
    .on(
      'tt.lection_update',
      function () {

        var i = 0,
          text = '',
          alpha = 1;
        while (i < tt.lection.length) {
          alpha = (tt.lection
            .length - i) /
            tt.lection.length;
          //workaround since chrome bug
          if (i == 0) {
            color =
              'color:orange;font-size:2.7em;';
          } else {
            color =
              'color:rgba(255,255,255,' +
              alpha +
              ');font-size:' +
              (alpha *
              alpha) * 2.5 +
              'em;'
          }
          text +=
            '<span style="' +
            color + '">';

          if (i == 0 && tt.lection[
            i] == " ") {
            text += '[ ]'
          } else {
            text += tt.lection[
              i]
          }
          text += '</span>';
          i++;
        }
        $('#lesson')
          .html(text);
      });

  $('body')
    .on('tt.score_update',
      function () {
        $('#score')
          .html(
            'Misses|Hits: ' +
            tt.score.misses +
            ' - ' + tt.score.hits
        );
      });
  tt.init();
});
